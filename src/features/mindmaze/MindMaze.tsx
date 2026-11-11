import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AREAS } from '../../theme/areas'
import { getSummary, PageSummary } from '../../api/page'
import { playDoor, playTrumpet, playWrong, playClick } from '../../sfx/audio'
import { Dir, FLOOR_H, FLOORS, Floor, generateFloor, mulberry32, pathTo, step } from './maze'
import { PoolEntry, Question, buildQuestion, choiceArticle, fetchPool, scoreFor } from './questions'
import { RoomScene } from './RoomScene'
import { CharacterFigure, CHARACTER_IDS } from './CharacterArt'
import { trackEvent } from '../../lib/analytics'
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
    trackEvent('mindmaze_start', { category: categoryId, difficulty })
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
  const roomSeed = game ? ((game.seed ^ (game.floor * 7919 + game.y * 131 + game.x * 17)) >>> 0) : 0
  const hostIdx = useMemo(() => Math.floor(mulberry32(roomSeed + 1)() * CAST.length), [roomSeed])
  const host = CAST[hostIdx]
  const hostId = CHARACTER_IDS[hostIdx]

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
          trackEvent('mindmaze_win', { score: g.score, category: g.categoryId, difficulty: g.difficulty })
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
        <div className="mm-room-frame" key={`${game.floor}-${game.x}-${game.y}`}>
          <RoomScene seed={roomSeed} open={cell.open} character={hostId} onDoor={knock} />
        </div>
        <div className="mm-host">
          <span className="mm-host-portrait">
            <CharacterFigure id={hostId} />
          </span>
          <span>
            <b>{host.name}:</b> {host.line}
          </span>
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
          <div className="mm-map-head">
            <span>FLOOR PLAN</span>
            <svg viewBox="0 0 24 24" className="mm-compass">
              <circle cx="12" cy="12" r="10" fill="none" stroke="#6b5a3a" strokeWidth="1.5" />
              <path d="M12 3 L14 12 L12 21 L10 12 Z" fill="#8f1a1a" />
              <path d="M3 12 L12 10 L21 12 L12 14 Z" fill="#6b5a3a" />
              <text x="12" y="2.5" textAnchor="middle" fontSize="5" fill="#6b5a3a">N</text>
            </svg>
          </div>
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
    <div className="mm-fuse" title="Answer before the fuse burns out — faster earns more">
      <span className="mm-fuse-burn" style={{ width: `${frac * 100}%` }} />
      {frac > 0 && <span className="mm-fuse-spark" style={{ left: `calc(${frac * 100}% - 6px)` }} />}
    </div>
  )
}

/** Night approach to the castle: moon, bats, moat, lit windows, jester waiting. */
function JesterArt() {
  return (
    <svg viewBox="0 0 320 200" className="mm-jester">
      <defs>
        <linearGradient id="mmnight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a0e1e" />
          <stop offset="1" stopColor="#1c1a2e" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill="url(#mmnight)" />
      {/* stars + moon */}
      {[[20, 20], [60, 38], [120, 14], [250, 24], [296, 48], [180, 30], [288, 90]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 ? 1 : 1.6} fill="#e8e4d0" opacity="0.8" />
      ))}
      <circle cx="268" cy="38" r="20" fill="#e8e4d0" />
      <circle cx="261" cy="33" r="4" fill="#cfcab4" />
      <circle cx="274" cy="44" r="3" fill="#cfcab4" />
      {/* bats */}
      <path d="M210 60 q4 -5 8 0 q4 -5 8 0 M232 44 q3 -4 6 0 q3 -4 6 0" stroke="#000" strokeWidth="2" fill="none" />
      {/* castle silhouette */}
      <g fill="#201c2a" stroke="#120f1a" strokeWidth="2">
        <rect x="60" y="78" width="200" height="86" />
        <rect x="44" y="58" width="40" height="106" />
        <rect x="236" y="58" width="40" height="106" />
        <rect x="140" y="48" width="40" height="116" />
        {[44, 56, 68, 236, 248, 260].map((x) => (
          <rect key={x} x={x} y="50" width="9" height="10" />
        ))}
        {[140, 152, 164, 172].map((x) => (
          <rect key={x} x={x} y="40" width="8" height="10" />
        ))}
      </g>
      {/* pennants */}
      <path d="M160 40 v-14 l12 4 l-12 4 M64 50 v-12 l10 3 l-10 3 M256 50 v-12 l10 3 l-10 3" stroke="#8f1a1a" fill="#8f1a1a" strokeWidth="1.5" />
      {/* lit windows */}
      {[[72, 94], [100, 110], [156, 80], [206, 100], [248, 92], [120, 132]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y + 10} v-7 a4 4 0 0 1 8 0 v7 Z`} fill="#e8a33c">
          <animate attributeName="opacity" values="0.7;1;0.8;1" dur={`${1.6 + i * 0.4}s`} repeatCount="indefinite" />
        </path>
      ))}
      {/* gate + portcullis */}
      <path d="M138 164 v-30 a22 22 0 0 1 44 0 v30 Z" fill="#0c0a12" />
      <path d="M144 164 v-32 M152 164 v-36 M160 164 v-37 M168 164 v-36 M176 164 v-32 M138 142 h44 M138 152 h44" stroke="#3a3346" strokeWidth="2" />
      {/* moat + drawbridge */}
      <path d="M0 176 q40 -6 80 0 q40 6 80 0 q40 -6 80 0 q40 6 80 0 v24 h-320 Z" fill="#14202e" />
      <path d="M26 176 q30 -4 60 0 M160 180 q30 -4 60 0 M250 174 q24 -3 48 0" stroke="#223446" strokeWidth="2" fill="none" />
      <polygon points="128,196 192,196 186,160 134,160" fill="#4a3a26" stroke="#2e2416" strokeWidth="2" />
      <line x1="136" y1="162" x2="118" y2="130" stroke="#2e2416" strokeWidth="3" />
      <line x1="184" y1="162" x2="202" y2="130" stroke="#2e2416" strokeWidth="3" />
      {/* jester with lantern on the bridge */}
      <g>
        <circle cx="160" cy="172" r="6" fill="#e8c49a" />
        <path d="M154 169 q-6 -7 1 -9 q2 5 -1 9 M166 169 q6 -7 -1 -9 q-2 5 1 9" fill="#8f1a1a" />
        <circle cx="153" cy="161" r="1.8" fill="#d4af37" />
        <circle cx="167" cy="161" r="1.8" fill="#d4af37" />
        <path d="M155 178 h10 l-1 14 h-8 Z" fill="#8f1a1a" />
        <line x1="165" y1="182" x2="176" y2="178" stroke="#e8c49a" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="175" y="176" width="7" height="9" rx="1.5" fill="#241e18" stroke="#9a7b1f" />
        <circle cx="178.5" cy="180.5" r="2" fill="#e8a33c">
          <animate attributeName="opacity" values="0.7;1;0.7" dur="1.4s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  )
}
