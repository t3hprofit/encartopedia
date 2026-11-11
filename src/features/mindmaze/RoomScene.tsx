// The castle room, drawn fresh for every cell: seeded stonework, flickering
// torchlight, period clutter, and the resident who happens to be in.

import { useMemo } from 'react'
import { Dir, mulberry32 } from './maze'
import { CharacterFigure, CharacterId } from './CharacterArt'

interface RoomSceneProps {
  seed: number
  open: Record<Dir, boolean>
  character: CharacterId
  onDoor: (d: Dir) => void
}

const STONE_SHADES = ['#4a4238', '#453d34', '#4e463b', '#443c33', '#514940', '#473f36']

export function RoomScene({ seed, open, character, onDoor }: RoomSceneProps) {
  // everything positional derives from the seed so revisits look identical
  const { stones, decor, charSide } = useMemo(() => {
    const rand = mulberry32(seed)
    const stones: { x: number; y: number; w: number; h: number; fill: string }[] = []
    const rows = 7
    for (let r = 0; r < rows; r++) {
      const y = 70 + r * 37
      const offset = r % 2 ? 30 : 0
      for (let x = 80 - offset; x < 560; x += 62) {
        stones.push({
          x,
          y,
          w: 58 + rand() * 6 - 3,
          h: 34,
          fill: STONE_SHADES[Math.floor(rand() * STONE_SHADES.length)],
        })
      }
    }
    const all: DecorKind[] = ['tapestry', 'window', 'armor', 'chest', 'shield', 'barrel', 'candles', 'painting']
    const first = all[Math.floor(rand() * all.length)]
    let second = all[Math.floor(rand() * all.length)]
    if (second === first) second = all[(all.indexOf(first) + 3) % all.length]
    const decor: { kind: DecorKind; slot: 0 | 1 }[] = [
      { kind: first, slot: 0 },
      { kind: second, slot: 1 },
    ]
    const cobwebs = rand() < 0.5
    if (cobwebs) decor.push({ kind: 'cobweb', slot: 0 })
    return { stones, decor, charSide: rand() < 0.5 ? 'left' : 'right' }
  }, [seed])

  // keep the figure out of the way of side doors
  const charX = charSide === 'left' ? (open.W ? 215 : 150) : open.E ? 425 : 480

  return (
    <svg viewBox="0 0 640 400" className="mm-room-art" key={seed}>
      <defs>
        <radialGradient id="mmtorch" cx="0.22" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#f0b860" stopOpacity="0.32" />
          <stop offset="0.45" stopColor="#c08a3c" stopOpacity="0.12" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="mmvignette" cx="0.5" cy="0.45" r="0.75">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.55" />
        </radialGradient>
        <linearGradient id="mmwood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3a2718" />
          <stop offset="0.5" stopColor="#4a3220" />
          <stop offset="1" stopColor="#32200f" />
        </linearGradient>
      </defs>

      {/* ceiling with rib vault */}
      <rect width="640" height="70" fill="#241f1a" />
      <path d="M80 70 Q320 10 560 70" fill="none" stroke="#2e2822" strokeWidth="10" />
      <path d="M80 70 Q320 34 560 70" fill="none" stroke="#1d1813" strokeWidth="5" />

      {/* side walls */}
      <polygon points="0,0 80,70 80,330 0,400" fill="#352e26" />
      <polygon points="640,0 560,70 560,330 640,400" fill="#2d2720" />
      {Array.from({ length: 5 }, (_, i) => (
        <g key={i} stroke="#272119" strokeWidth="2">
          <line x1={0} y1={30 + i * 78} x2={80} y2={86 + i * 52} />
          <line x1={640} y1={30 + i * 78} x2={560} y2={86 + i * 52} />
        </g>
      ))}

      {/* back wall stonework */}
      <rect x="80" y="70" width="480" height="260" fill="#413930" />
      {stones.map((s, i) => (
        <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} fill={s.fill} stroke="#2b251e" strokeWidth="2" rx="2" />
      ))}

      {/* floor flagstones in perspective */}
      <polygon points="0,400 80,330 560,330 640,400" fill="#332b24" />
      <path d="M80 330 L0 400 M200 330 L160 400 M320 330 L320 400 M440 330 L480 400 M560 330 L640 400" stroke="#241e18" strokeWidth="3" />
      <path d="M53 353 h534 M110 345 h420" stroke="#241e18" strokeWidth="2.5" />

      {/* decor */}
      {decor.map((d, i) => (
        <Decor key={i} kind={d.kind} slot={d.slot} />
      ))}

      {/* torch + light pools */}
      <g>
        <rect x="116" y="118" width="9" height="40" fill="#5a4632" rx="2" />
        <path d="M112 118 h17 l-3 6 h-11 Z" fill="#3a2f22" />
        <path d="M120.5 100 q-9 10 0 18 q9 -8 0 -18" fill="#e8a33c">
          <animate attributeName="opacity" values="0.85;1;0.8;0.95;0.85" dur="1.1s" repeatCount="indefinite" />
        </path>
        <path d="M120.5 106 q-4.5 6 0 11 q4.5 -5 0 -11" fill="#f6d06a">
          <animate attributeName="opacity" values="1;0.7;1" dur="0.9s" repeatCount="indefinite" />
        </path>
      </g>
      <rect width="640" height="400" fill="url(#mmtorch)" style={{ pointerEvents: 'none' }}>
        <animate attributeName="opacity" values="1;0.88;1;0.93;1" dur="2.2s" repeatCount="indefinite" />
      </rect>

      {/* the resident */}
      <g transform={`translate(${charX - 40} 212) scale(0.88)`} className="mm-figure-slot">
        <ellipse cx="45" cy="126" rx="26" ry="5" fill="#000" opacity="0.45" />
        <CharacterFigure id={character} />
      </g>

      {/* doors */}
      {open.N && <ArchDoor x={320} y={330} scale={1} label="N" onClick={() => onDoor('N')} />}
      {open.W && <ArchDoor x={118} y={342} scale={0.78} label="W" onClick={() => onDoor('W')} lean={10} />}
      {open.E && <ArchDoor x={522} y={342} scale={0.78} label="E" onClick={() => onDoor('E')} lean={-10} />}
      {open.S && (
        <g className="mm-door" onClick={() => onDoor('S')}>
          <rect x="270" y="370" width="100" height="22" rx="5" fill="#241e18" stroke="#9a7b1f" strokeWidth="1.5" />
          <text x="320" y="385" textAnchor="middle" fontSize="12" fill="#e7cf84" fontFamily="Georgia">
            S ⟲ behind you
          </text>
        </g>
      )}

      {/* vignette on top of everything but pointer-transparent */}
      <rect width="640" height="400" fill="url(#mmvignette)" style={{ pointerEvents: 'none' }} />
    </svg>
  )
}

/** Arched stone surround + studded plank door with ring handle. */
function ArchDoor({ x, y, scale, label, onClick, lean = 0 }: { x: number; y: number; scale: number; label: string; onClick: () => void; lean?: number }) {
  return (
    <g className="mm-door" transform={`translate(${x} ${y}) scale(${scale}) skewY(${lean / 10})`} onClick={onClick}>
      {/* stone arch surround with keystone */}
      <path d="M-62 4 v-130 a62 62 0 0 1 124 0 v130 Z" fill="#524a3f" stroke="#2b251e" strokeWidth="3" />
      <path d="M-10 -186 l20 0 l6 24 l-32 0 Z" fill="#5c5448" stroke="#2b251e" strokeWidth="2" />
      {/* door recess */}
      <path d="M-48 2 v-122 a48 48 0 0 1 96 0 v122 Z" fill="#1a120a" />
      {/* plank door */}
      <path d="M-44 0 v-118 a44 44 0 0 1 88 0 v118 Z" fill="url(#mmwood)" stroke="#120b06" strokeWidth="3" />
      {Array.from({ length: 3 }, (_, i) => (
        <line key={i} x1={-22 + i * 22} y1={-4} x2={-22 + i * 22} y2={-150} stroke="#241505" strokeWidth="2" />
      ))}
      {/* iron straps + studs */}
      <rect x="-44" y="-52" width="88" height="8" fill="#2b2b30" rx="2" />
      <rect x="-44" y="-112" width="88" height="8" fill="#2b2b30" rx="2" />
      {[-34, -12, 10, 32].map((sx) => (
        <g key={sx}>
          <circle cx={sx} cy={-48} r="2.5" fill="#54545c" />
          <circle cx={sx} cy={-108} r="2.5" fill="#54545c" />
        </g>
      ))}
      {/* ring handle on back plate */}
      <circle cx="26" cy="-76" r="6" fill="#2b2b30" />
      <circle cx="26" cy="-68" r="8" fill="none" stroke="#54545c" strokeWidth="3" />
      {/* glow + plaque */}
      <path className="mm-door-glow" d="M-48 2 v-122 a48 48 0 0 1 96 0 v122 Z" fill="none" stroke="#d4af37" strokeWidth="4" opacity="0" />
      <rect x="-16" y="-180" width="32" height="20" rx="3" fill="#241e18" stroke="#9a7b1f" strokeWidth="1.5" />
      <text x="0" y="-165" textAnchor="middle" fontSize="15" fill="#e7cf84" fontFamily="Georgia">
        {label}
      </text>
    </g>
  )
}

type DecorKind = 'tapestry' | 'window' | 'armor' | 'chest' | 'shield' | 'barrel' | 'candles' | 'painting' | 'cobweb'

/** Wall/floor clutter. Slot 0 = back-left, slot 1 = back-right. */
function Decor({ kind, slot }: { kind: DecorKind; slot: 0 | 1 }) {
  const wx = slot === 0 ? 175 : 440 // wall anchor
  const fx = slot === 0 ? 195 : 450 // floor anchor
  switch (kind) {
    case 'tapestry':
      return (
        <g>
          <rect x={wx - 10} y="92" width="86" height="8" fill="#5a4632" />
          <path d={`M${wx} 100 h66 v78 l-8 10 l-9 -10 l-8 10 l-9 -10 l-8 10 l-8 -10 l-8 10 l-8 -10 Z`} fill="#6d1b35" stroke="#4a1224" strokeWidth="2" />
          <path d={`M${wx + 8} 112 l25 30 l25 -30 M${wx + 14} 150 h38`} stroke="#c9a227" strokeWidth="3" fill="none" />
        </g>
      )
    case 'window':
      return (
        <g>
          <path d={`M${wx} 170 v-52 a26 26 0 0 1 52 0 v52 Z`} fill="#0e1424" stroke="#2b251e" strokeWidth="5" />
          <circle cx={wx + 36} cy={122} r="9" fill="#e8e4d0" opacity="0.9" />
          <circle cx={wx + 12} cy={112} r="1.3" fill="#e8e4d0" />
          <circle cx={wx + 20} cy={132} r="1" fill="#e8e4d0" />
          <line x1={wx + 13} y1="96" x2={wx + 13} y2="170" stroke="#2b251e" strokeWidth="4" />
          <line x1={wx + 26} y1="92" x2={wx + 26} y2="170" stroke="#2b251e" strokeWidth="4" />
          <line x1={wx + 39} y1="96" x2={wx + 39} y2="170" stroke="#2b251e" strokeWidth="4" />
        </g>
      )
    case 'armor':
      return (
        <g>
          <ellipse cx={fx} cy="326" rx="24" ry="5" fill="#000" opacity="0.4" />
          <rect x={fx - 16} y="300" width="32" height="24" fill="#3a332c" />
          <path d={`M${fx - 11} 258 q11 -6 22 0 l-2 26 q-9 4 -18 0 Z`} fill="#8a8f98" />
          <path d={`M${fx - 8} 234 h16 v14 q0 6 -8 6 q-8 0 -8 -6 Z`} fill="#9aa0aa" />
          <rect x={fx - 7} y="242" width="14" height="2.5" fill="#2b2b2b" />
          <path d={`M${fx - 20} 262 l-6 22 l5 1 l7 -20 Z M${fx + 20} 262 l6 22 l-5 1 l-7 -20 Z`} fill="#767b84" />
          <rect x={fx + 24} y="238" width="4" height="62" fill="#6b4f2a" />
          <path d={`M${fx + 20} 238 h12 l-6 -14 Z`} fill="#9aa0aa" />
        </g>
      )
    case 'chest':
      return (
        <g>
          <ellipse cx={fx} cy="324" rx="30" ry="5" fill="#000" opacity="0.4" />
          <path d={`M${fx - 26} 322 v-22 h52 v22 Z`} fill="#5a4230" stroke="#3a2a1a" strokeWidth="2" />
          <path d={`M${fx - 26} 300 q26 -14 52 0 Z`} fill="#6b4f39" stroke="#3a2a1a" strokeWidth="2" />
          <rect x={fx - 4} y="298" width="8" height="12" fill="#2b2b30" />
          <rect x={fx - 26} y="306" width="52" height="3" fill="#2b2b30" />
        </g>
      )
    case 'shield':
      return (
        <g>
          <path d={`M${wx + 10} 104 h46 v34 q0 20 -23 28 q-23 -8 -23 -28 Z`} fill="#8f1a1a" stroke="#4a1212" strokeWidth="3" />
          <path d={`M${wx + 10} 121 h46 M${wx + 33} 104 v62`} stroke="#d4af37" strokeWidth="4" />
          <path d={`M${wx + 2} 96 l62 0`} stroke="#5a4632" strokeWidth="5" />
        </g>
      )
    case 'barrel':
      return (
        <g>
          <ellipse cx={fx} cy="322" rx="22" ry="4" fill="#000" opacity="0.4" />
          <path d={`M${fx - 17} 320 q-5 -26 0 -46 q17 -6 34 0 q5 20 0 46 q-17 5 -34 0 Z`} fill="#6b4f39" stroke="#3a2a1a" strokeWidth="2" />
          <path d={`M${fx - 18} 288 q18 -5 36 0 M${fx - 18} 306 q18 5 36 0`} stroke="#2b2b30" strokeWidth="3" fill="none" />
          <line x1={fx} y1="274" x2={fx} y2="320" stroke="#4a3626" strokeWidth="2" />
        </g>
      )
    case 'candles':
      return (
        <g>
          <rect x={wx + 28} y="240" width="5" height="86" fill="#2b2b30" />
          <path d={`M${wx + 10} 240 h41 M${wx + 10} 240 v-8 M${wx + 30.5} 240 v-12 M${wx + 51} 240 v-8`} stroke="#2b2b30" strokeWidth="4" fill="none" />
          {[10, 30.5, 51].map((cx, i) => (
            <g key={i}>
              <rect x={wx + cx - 2.5} y={i === 1 ? 216 : 222} width="5" height="10" fill="#e8e0c0" />
              <circle cx={wx + cx} cy={i === 1 ? 211 : 217} r="3.5" fill="#e8a33c">
                <animate attributeName="opacity" values="0.8;1;0.85;1" dur={`${1 + i * 0.3}s`} repeatCount="indefinite" />
              </circle>
            </g>
          ))}
          <ellipse cx={wx + 30} cy="328" rx="16" ry="3.5" fill="#000" opacity="0.4" />
        </g>
      )
    case 'painting':
      return (
        <g>
          <rect x={wx} y="104" width="78" height="58" fill="#241e18" stroke="#9a7b1f" strokeWidth="4" />
          <path d={`M${wx + 7} 150 l17 -20 l12 12 l11 -15 l16 22 Z`} fill="#4e6d4e" />
          <circle cx={wx + 62} cy="118" r="6" fill="#e7cf84" />
          <path d={`M${wx + 30} 96 l9 -8 l9 8`} stroke="#9a7b1f" strokeWidth="2" fill="none" />
        </g>
      )
    case 'cobweb':
      return (
        <g stroke="#9a9484" strokeWidth="1" opacity="0.4" fill="none">
          <path d="M560 70 q-20 4 -36 0 M560 70 q-16 12 -30 14 M560 70 q-6 18 -16 26 M560 70 q2 22 0 34" />
          <path d="M545 74 q-8 8 -10 16 M552 72 q-4 12 -10 20" />
        </g>
      )
  }
}
