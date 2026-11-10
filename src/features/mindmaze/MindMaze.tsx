import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AREAS } from '../../theme/areas'
import { getSummary, PageSummary } from '../../api/page'
import { playDoor, playTrumpet, playWrong, playClick } from '../../sfx/audio'
import { Dir, FLOOR_H, FLOORS, Floor, generateFloor, mulberry32, pathTo, step } from './maze'
import { PoolEntry, Question, buildQuestion, choiceArticle, fetchPool, scoreFor } from './questions'
import './mindmaze.css'

type Phase = 'intro' | 'setup' | 'play' | 'throne'

interface SavedGame {
  seed: number
  categoryId: string
  difficulty: number
  floor: number
  x: number
  y: number
  score: number
  matches: number
  visited: string[]
}

const SAVE_KEY = 'encartopedia.mindmaze.save'
const WIN_SCORE = 20000

const CAST: { name: string; line: string }[] = [
  { name: 'The Jester', line: 'Welcome, welcome! The king is cursed, the larder is empty, and the questions are plentiful.' },
  { name: 'The Sorceress', line: 'A witch? Certainly not. I am a sorceress who merely happens to look like this.' },
  { name: 'The Knight', line: 'I would open these doors myself, but my visor rusted shut in 1372.' },
  { name: 'The Ghost', line: 'I failed a question once. Once.' },
  { name: 'The Castle Cat', line: 'Mrrow. (The cat regards you with medieval indifference.)' },
  { name: 'The Wizard', line: 'Knowledge opens doors. Literally, in this establishment.' },
  { name: 'The Alchemist', line: 'Stay a while! I am this close to turning lead into slightly shinier lead.' },
  { name: 'The Queen', line: 'His Majesty spent the entire treasury on a curse. Men.' },
]

const INTRO_PAGES = [
  'A dusty tome. A flash of green light. A smell of tallow candles and regret. You are no longer in front of your computer — you are standing on the drawbridge of a very old castle, and a jester is beckoning you inside.',
  '“Oh good, the sorceress found someone,” says the jester. “This is the castle of King Miser the First — cursed, the lot of us, for the king’s greed. The curse feeds on ignorance. Only answers weaken it.”',
  '“Climb the castle, strange one from another time. Every door asks a question; every question is in the great encyclopedia. Earn twenty thousand points and the way to the throne room opens — and the sorceress will send you home.”',
]

export function MindMaze() {
  const [phase, setPhase] = useState<Phase>('intro')
  const [introPage, setIntroPage] = useState(0)
  const [categoryId, setCategoryId] = useState<string>('all')
  const [difficulty, setDifficulty] = useState(2)
  const [game, setGame] = useState<SavedGame | null>(null)
  const [pool, setPool] = useState<PoolEntry[]>([])
  const [question, setQuestion] = useState<{ q: Question; dir: Dir; attempt: number; startedAt: number } | null>(null)
  const [reveal, setReveal] = useState<{ x: number; y: number }[] | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [research, setResearch] = useState<PageSummary | null>(null)
  const [researchBusy, setResearchBusy] = useState(false)
  const randRef = useRef(mulberry32(Date.now() & 0xffffffff))

  // resume a saved game
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY) ?? 'null') as SavedGame | null
      if (saved) {
        setGame(saved)
        setCategoryId(saved.categoryId)
        setDifficulty(saved.difficulty)
        setPhase('play')
      }
    } catch {
      /* fresh start */
    }
  }, [])

  // keep the question pool stocked
  useEffect(() => {
    if (phase !== 'play' || !game) return
    const ctl = new AbortController()
    fetchPool(game.categoryId as never, game.difficulty, ctl.signal)
      .then(setPool)
      .catch(() => {})
    return () => ctl.abort()
  }, [phase, game?.categoryId, game?.difficulty]) // eslint-disable-line react-hooks/exhaustive-deps

  const floors = useMemo<Floor[]>(() => {
    if (!game) return []
    return Array.from({ length: FLOORS }, (_, i) => generateFloor(game.seed + i * 1009))
  }, [game?.seed]) // eslint-disable-line react-hooks/exhaustive-deps

  const save = useCallback((g: SavedGame) => {
    setGame(g)
    localStorage.setItem(SAVE_KEY, JSON.stringify(g))
  }, [])

  const start = () => {
    playDoor()
    const g: SavedGame = {
      seed: Date.now() & 0xffffffff,
      categoryId,
      difficulty,
      floor: 0,
      x: 0,
      y: FLOOR_H - 1,
      score: 0,
      matches: 5,
      visited: [`0,${FLOOR_H - 1},0`],
    }
    save(g)
    setPhase('play')
  }

  const quit = () => {
    localStorage.removeItem(SAVE_KEY)
    setGame(null)
    setQuestion(null)
    setPhase('intro')
    setIntroPage(0)
  }

  const floor = game ? floors[game.floor] : null
  const cell = floor && game ? floor.cells[game.y][game.x] : null
  const host = useMemo(() => {
    if (!game) return CAST[0]
    const r = mulberry32(game.seed + game.floor * 97 + game.y * 31 + game.x)()
    return CAST[Math.floor(r * CAST.length)]
  }, [game?.x, game?.y, game?.floor, game?.seed]) // eslint-disable-line react-hooks/exhaustive-deps

  const knock = (dir: Dir) => {
    if (!cell?.open[dir] || question) return
    playClick()
    const q = buildQuestion(pool, game!.difficulty, randRef.current)
    if (!q) {
      setToast('The door mumbles: the question pool is still being fetched from the scriptorium…')
      setTimeout(() => setToast(null), 2500)
      return
    }
    setQuestion({ q, dir, attempt: 1, startedAt: Date.now() })
  }

  const answer = (idx: number) => {
    if (!question || !game || !floor) return
    const { q, dir, attempt, startedAt } = question
    if (q.choices[idx].isCorrect) {
      const pts = scoreFor(q.base, Date.now() - startedAt, attempt)
      playTrumpet()
      if (randRef.current() < 0.25 && 'speechSynthesis' in window) {
        speechSynthesis.speak(new SpeechSynthesisUtterance('Congratulations. You have answered well.'))
      }
      playDoor()
      const npos = step(game.x, game.y, dir)
      const onStair = npos.x === floor.stair.x && npos.y === floor.stair.y
      let g: SavedGame = {
        ...game,
        x: npos.x,
        y: npos.y,
        score: game.score + pts,
        visited: [...new Set([...game.visited, `${npos.x},${npos.y},${game.floor}`])],
      }
      setQuestion(null)
      if (onStair) {
        if (g.score >= WIN_SCORE) {
          save(g)
          localStorage.removeItem(SAVE_KEY)
          setPhase('throne')
          return
        }
        const nextFloor = (g.floor + 1) % FLOORS
        g = { ...g, floor: nextFloor, x: 0, y: FLOOR_H - 1, visited: [...g.visited, `0,${FLOOR_H - 1},${nextFloor}`] }
        setToast(
          g.floor === 0
            ? 'The stairs spiral… downward? The curse rearranges the castle. (Score carries on.)'
            : `You climb to floor ${g.floor + 1}. The sconces smell of 1372. ${WIN_SCORE.toLocaleString()} points opens the throne room.`,
        )
        setTimeout(() => setToast(null), 3500)
      } else if (pts > 0) {
        setToast(`+${pts} points`)
        setTimeout(() => setToast(null), 1200)
      }
      save(g)
    } else {
      playWrong()
      if (attempt === 1) {
        setQuestion({ ...question, attempt: 2 })
      } else {
        setQuestion(null)
        setToast('The door remains shut. It will have a new question for you.')
        setTimeout(() => setToast(null), 2000)
      }
    }
  }

  const strikeMatch = () => {
    if (!game || !floor || game.matches <= 0 || reveal) return
    playClick()
    save({ ...game, matches: game.matches - 1 })
    setReveal(pathTo(floor.cells, game.x, game.y, floor.stair.x, floor.stair.y))
    setTimeout(() => setReveal(null), 4000)
  }

  const openResearch = async (idx: number) => {
    if (!question) return
    const title = choiceArticle(question.q, pool, idx)
    if (!title) return
    setResearchBusy(true)
    try {
      setResearch(await getSummary(title))
    } catch {
      setResearch({ title, extract: 'The scriptorium could not find that volume.' } as PageSummary)
    } finally {
      setResearchBusy(false)
    }
  }

  /* ---------------- renders ---------------- */

  if (phase === 'intro') {
    return (
      <div className="mm-stage mm-intro">
        <div className="mm-story">
          <JesterArt />
          <h1>MindMaze</h1>
          <p>{INTRO_PAGES[introPage]}</p>
          <div className="mm-row">
            {introPage < INTRO_PAGES.length - 1 ? (
              <button className="e-btn gold" onClick={() => setIntroPage((p) => p + 1)}>
                Continue ▶
              </button>
            ) : (
              <button className="e-btn gold" onClick={() => setPhase('setup')}>
                Enter the Castle ▶
              </button>
            )}
            {introPage === 0 && (
              <button className="e-btn" onClick={() => setPhase('setup')}>
                Skip the tale
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'setup') {
    return (
      <div className="mm-stage mm-setup">
        <div className="mm-panel">
          <h2>Choose your trial</h2>
          <div className="mm-setup-grid">
            <fieldset>
              <legend>Questions about</legend>
              <label>
                <input type="radio" checked={categoryId === 'all'} onChange={() => setCategoryId('all')} /> All of the
                above (everything)
              </label>
              {AREAS.map((a) => (
                <label key={a.id}>
                  <input type="radio" checked={categoryId === a.id} onChange={() => setCategoryId(a.id)} /> {a.label}
                </label>
              ))}
            </fieldset>
            <fieldset>
              <legend>Difficulty</legend>
              {['Apprentice', 'Scholar', 'Sage', 'Loremaster'].map((d, i) => (
                <label key={d}>
                  <input type="radio" checked={difficulty === i + 1} onChange={() => setDifficulty(i + 1)} /> {d}{' '}
                  <small>({[250, 500, 750, 1000][i]} pts/door)</small>
                </label>
              ))}
            </fieldset>
          </div>
          <p className="mm-note">
            Answer within 60 seconds for points — the faster, the more. Two attempts per door. Five matches light the
            way. {WIN_SCORE.toLocaleString()} points opens the throne room.
          </p>
          <button className="e-btn gold" onClick={start}>
            Cross the Drawbridge ▶
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'throne') {
    return (
      <div className="mm-stage mm-intro">
        <div className="mm-story">
          <h1>The Throne Room</h1>
          <p>
            The doors swing open onto candlelight and an enormous banquet. King Miser the First — looking considerably
            less cursed — rises. <i>“Strange one from another time: the castle thanks you. The curse is lifted, the
            larder is mysteriously full, and the jester is almost funny again.”</i>
          </p>
          <p>
            The alchemist tugs your sleeve and offers you a permanent position. The sorceress rolls her eyes, draws a
            circle of green fire, and — <i>“home with you, before he makes you an apprentice”</i> — sends you back to
            your own century.
          </p>
          <p className="mm-note">Final score: {game?.score.toLocaleString() ?? WIN_SCORE.toLocaleString()} points.</p>
          <button className="e-btn gold" onClick={quit}>
            Play Again ▶
          </button>
        </div>
      </div>
    )
  }

  if (!game || !floor || !cell) return null

  return (
    <div className="mm-stage mm-play">
      <div className="mm-room">
        <RoomArt cell={cell} onDoor={knock} />
        <div className="mm-host">
          <b>{host.name}:</b> {host.line}
        </div>
      </div>
      <div className="mm-side">
        <div className="mm-score">
          <div>
            <small>SCORE</small>
            <b>{game.score.toLocaleString()}</b>
          </div>
          <div>
            <small>FLOOR</small>
            <b>
              {game.floor + 1} / {FLOORS}
            </b>
          </div>
        </div>
        <div className="mm-map">
          {floor.cells.map((row, y) => (
            <div className="mm-map-row" key={y}>
              {row.map((c, x) => {
                const here = game.x === x && game.y === y
                const seen = game.visited.includes(`${x},${y},${game.floor}`)
                const lit = reveal?.some((p) => p.x === x && p.y === y)
                const isStair = floor.stair.x === x && floor.stair.y === y && (seen || lit)
                return (
                  <span
                    key={x}
                    className={`mm-map-cell ${seen ? 'seen' : ''} ${lit ? 'lit' : ''} ${here ? 'here' : ''}`}
                    style={{
                      borderTopWidth: c.open.N ? 0 : 1,
                      borderRightWidth: c.open.E ? 0 : 1,
                      borderBottomWidth: c.open.S ? 0 : 1,
                      borderLeftWidth: c.open.W ? 0 : 1,
                    }}
                  >
                    {here ? '☺' : isStair ? '▲' : ''}
                  </span>
                )
              })}
            </div>
          ))}
        </div>
        <div className="mm-matches">
          <small>MATCHES</small>
          {Array.from({ length: 5 }, (_, i) => (
            <button
              key={i}
              className="mm-match"
              disabled={i >= game.matches || !!reveal}
              onClick={strikeMatch}
              title="Strike a match — briefly lights the path to the stairs"
            >
              ⌇
            </button>
          ))}
        </div>
        <button className="e-btn" onClick={quit}>
          Abandon the Castle
        </button>
      </div>

      {question && (
        <div className="mm-q-backdrop">
          <div className="mm-q">
            <div className="mm-q-title">
              The {question.dir === 'N' ? 'north' : question.dir === 'S' ? 'south' : question.dir === 'E' ? 'east' : 'west'}{' '}
              door asks{question.attempt === 2 ? ' (second attempt — half points)' : ''}:
            </div>
            <QuestionTimer startedAt={question.startedAt} />
            <p className="mm-q-prompt">{question.q.prompt}</p>
            {question.q.choices.map((c, i) => (
              <div className="mm-q-choice" key={i}>
                <button className="e-btn mm-q-answer" onClick={() => answer(i)}>
                  {c.title}
                </button>
                <button className="mm-q-research" title="Research this answer in the encyclopedia" onClick={() => openResearch(i)}>
                  ?
                </button>
              </div>
            ))}
            <button className="mm-q-flee" onClick={() => setQuestion(null)}>
              Back away from the door
            </button>
          </div>
        </div>
      )}

      {(research || researchBusy) && (
        <div className="mm-q-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setResearch(null)}>
          <div className="mm-q mm-research">
            <div className="mm-q-title">{researchBusy ? 'Consulting the encyclopedia…' : research?.title}</div>
            {research && (
              <>
                {research.thumbnail && <img src={research.thumbnail.source} alt="" />}
                <p>{research.extract}</p>
                <p className="mm-note">Every answer in MindMaze is an article. The rabbit hole is the point.</p>
              </>
            )}
            <button className="e-btn" onClick={() => setResearch(null)}>
              Back to the door
            </button>
          </div>
        </div>
      )}

      {toast && <div className="mm-toast">{toast}</div>}
    </div>
  )
}

function QuestionTimer({ startedAt }: { startedAt: number }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(t)
  }, [])
  const frac = Math.max(0, 1 - (now - startedAt) / 60000)
  return (
    <div className="mm-timer">
      <span style={{ width: `${frac * 100}%`, background: frac > 0.33 ? 'var(--e-gold)' : '#b33' }} />
    </div>
  )
}

/** The stone room, first-person-ish, doors appearing where passages exist. */
function RoomArt({ cell, onDoor }: { cell: { open: Record<Dir, boolean> }; onDoor: (d: Dir) => void }) {
  return (
    <svg viewBox="0 0 640 400" className="mm-room-art">
      <defs>
        <linearGradient id="mmfloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a4038" />
          <stop offset="1" stopColor="#2b2520" />
        </linearGradient>
      </defs>
      {/* walls */}
      <rect width="640" height="400" fill="#3a332c" />
      <polygon points="0,0 640,0 560,70 80,70" fill="#453c33" />
      <polygon points="0,0 80,70 80,330 0,400" fill="#38302a" />
      <polygon points="640,0 560,70 560,330 640,400" fill="#332c26" />
      <rect x="80" y="70" width="480" height="260" fill="#413930" />
      <polygon points="0,400 80,330 560,330 640,400" fill="url(#mmfloor)" />
      {/* stone courses */}
      {Array.from({ length: 5 }, (_, i) => (
        <line key={i} x1="80" y1={100 + i * 48} x2="560" y2={100 + i * 48} stroke="#352e27" strokeWidth="2" />
      ))}
      {/* torch */}
      <g>
        <rect x="120" y="120" width="8" height="34" fill="#5a4632" />
        <circle cx="124" cy="112" r="10" fill="#e8a33c" opacity="0.85">
          <animate attributeName="r" values="9;11;9" dur="1.3s" repeatCount="indefinite" />
        </circle>
      </g>
      {/* wall painting */}
      <g>
        <rect x="170" y="110" width="90" height="66" fill="#241e18" stroke="#9a7b1f" strokeWidth="4" />
        <path d="M178 160 l20 -22 l14 14 l12 -16 l18 24 Z" fill="#4e7d4e" />
        <circle cx="240" cy="126" r="7" fill="#e7cf84" />
      </g>
      {/* doors */}
      {cell.open.N && <Door x={320} y={330} scale={1} label="N" onClick={() => onDoor('N')} />}
      {cell.open.W && <Door x={120} y={345} scale={0.8} label="W" onClick={() => onDoor('W')} skew={18} />}
      {cell.open.E && <Door x={520} y={345} scale={0.8} label="E" onClick={() => onDoor('E')} skew={-18} />}
      {cell.open.S && (
        <g className="mm-door" onClick={() => onDoor('S')}>
          <rect x="285" y="372" width="70" height="20" rx="4" fill="#241e18" stroke="#9a7b1f" />
          <text x="320" y="386" textAnchor="middle" fontSize="11" fill="#e7cf84" fontFamily="Georgia">
            S ⟲ behind you
          </text>
        </g>
      )}
    </svg>
  )
}

function Door({ x, y, scale, label, onClick, skew = 0 }: { x: number; y: number; scale: number; label: string; onClick: () => void; skew?: number }) {
  return (
    <g className="mm-door" transform={`translate(${x} ${y}) scale(${scale}) skewY(${skew ? skew / 10 : 0})`} onClick={onClick}>
      <path d="M-45 0 v-120 a45 45 0 0 1 90 0 v120 Z" fill="#2b1a0e" stroke="#9a7b1f" strokeWidth="3" />
      <path d="M-45 0 v-120 a45 45 0 0 1 90 0 v120" fill="none" stroke="#120b06" strokeWidth="8" opacity="0.4" />
      <circle cx="28" cy="-55" r="5" fill="#d4af37" />
      <text x="0" y="-135" textAnchor="middle" fontSize="16" fill="#e7cf84" fontFamily="Georgia">
        {label}
      </text>
    </g>
  )
}

function JesterArt() {
  return (
    <svg viewBox="0 0 160 120" className="mm-jester">
      {/* drawbridge */}
      <rect x="20" y="96" width="120" height="10" fill="#5a4632" />
      <line x1="30" y1="96" x2="18" y2="70" stroke="#3a2f22" strokeWidth="3" />
      <line x1="130" y1="96" x2="142" y2="70" stroke="#3a2f22" strokeWidth="3" />
      {/* castle gate */}
      <rect x="40" y="30" width="80" height="66" fill="#4a4440" />
      <path d="M56 96 v-40 a24 24 0 0 1 48 0 v40 Z" fill="#241e18" />
      <rect x="36" y="20" width="12" height="14" fill="#4a4440" />
      <rect x="60" y="20" width="12" height="14" fill="#4a4440" />
      <rect x="88" y="20" width="12" height="14" fill="#4a4440" />
      <rect x="112" y="20" width="12" height="14" fill="#4a4440" />
      {/* dragon in window */}
      <circle cx="112" cy="50" r="7" fill="#1a2b1a" />
      <circle cx="110" cy="48" r="1.5" fill="#6fe06f" />
      {/* jester */}
      <g>
        <circle cx="80" cy="74" r="7" fill="#e8c49a" />
        <path d="M73 70 q-6 -8 2 -10 q2 6 -2 10 M87 70 q6 -8 -2 -10 q-2 6 2 10" fill="#8f1a1a" />
        <circle cx="71" cy="61" r="2" fill="#d4af37" />
        <circle cx="89" cy="61" r="2" fill="#d4af37" />
        <rect x="74" y="81" width="12" height="15" rx="3" fill="#8f1a1a" />
        <line x1="86" y1="84" x2="98" y2="78" stroke="#e8c49a" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  )
}
