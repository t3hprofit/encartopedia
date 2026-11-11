// The castle cast, drawn as small vector figures in the hand-illustrated
// spirit of the original. Order matches the CAST list in MindMaze.tsx.

export type CharacterId =
  | 'jester'
  | 'sorceress'
  | 'knight'
  | 'ghost'
  | 'cat'
  | 'wizard'
  | 'alchemist'
  | 'queen'

export const CHARACTER_IDS: CharacterId[] = [
  'jester',
  'sorceress',
  'knight',
  'ghost',
  'cat',
  'wizard',
  'alchemist',
  'queen',
]

/** A standing figure, ~90x130 viewBox, drawn to read well at small sizes.
 *  Width/height set as attributes so nested-SVG sizing works everywhere. */
export function CharacterFigure({ id }: { id: CharacterId }) {
  return (
    <svg viewBox="0 0 90 130" width="90" height="130" className="mm-figure">
      {FIGURES[id]}
    </svg>
  )
}

const skin = '#e8c49a'
const skinShade = '#c9a075'

const FIGURES: Record<CharacterId, JSX.Element> = {
  jester: (
    <g>
      {/* motley: half red, half gold */}
      <path d="M30 60 h15 v55 h-13 q-6 -28 -2 -55 Z" fill="#8f1a1a" />
      <path d="M45 60 h15 q4 27 -2 55 h-13 Z" fill="#c9a227" />
      <path d="M28 115 h16 l-2 8 h-16 Z" fill="#c9a227" />
      <path d="M46 115 h16 l2 8 h-16 Z" fill="#8f1a1a" />
      {/* arms akimbo */}
      <path d="M30 68 q-14 6 -12 20 l6 2 q0 -12 10 -16 Z" fill="#8f1a1a" />
      <path d="M60 68 q14 6 12 20 l-6 2 q0 -12 -10 -16 Z" fill="#c9a227" />
      <circle cx="18" cy="90" r="4" fill={skin} />
      <circle cx="72" cy="90" r="4" fill={skin} />
      {/* collar */}
      <path d="M30 58 l8 8 l7 -8 l7 8 l8 -8 v6 h-30 Z" fill="#f1e9d2" />
      {/* head */}
      <circle cx="45" cy="42" r="14" fill={skin} />
      <path d="M38 46 q7 6 14 0" stroke="#7a4a2a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="40" cy="39" r="1.8" fill="#2b1a0e" />
      <circle cx="50" cy="39" r="1.8" fill="#2b1a0e" />
      {/* two-horned cap with bells */}
      <path d="M33 36 q-12 -12 -4 -22 q8 2 10 14 Z" fill="#8f1a1a" />
      <path d="M57 36 q12 -12 4 -22 q-8 2 -10 14 Z" fill="#c9a227" />
      <circle cx="28" cy="14" r="3.5" fill="#d4af37" />
      <circle cx="62" cy="14" r="3.5" fill="#d4af37" />
      <path d="M33 36 q12 -6 24 0 l-2 6 q-10 -4 -20 0 Z" fill="#6d1414" />
    </g>
  ),
  sorceress: (
    <g>
      {/* long brown robe */}
      <path d="M32 58 q13 -6 26 0 q8 30 6 60 h-38 q-2 -30 6 -60 Z" fill="#5a4230" />
      <path d="M32 58 q13 -6 26 0 l-2 10 q-11 -4 -22 0 Z" fill="#6b4f39" />
      {/* claw hands over cauldron */}
      <path d="M30 70 q-12 10 -8 22 l6 0 q-2 -10 6 -16 Z" fill="#5a4230" />
      <path d="M60 70 q12 10 8 22 l-6 0 q2 -10 -6 -16 Z" fill="#5a4230" />
      <path d="M24 92 l-3 5 M27 93 l-1 6 M30 93 l1 6" stroke="#9bb86b" strokeWidth="2" strokeLinecap="round" />
      <path d="M66 92 l3 5 M63 93 l1 6 M60 93 l-1 6" stroke="#9bb86b" strokeWidth="2" strokeLinecap="round" />
      {/* cauldron */}
      <ellipse cx="45" cy="112" rx="18" ry="5" fill="#1d1d1d" />
      <path d="M27 112 q2 14 18 14 q16 0 18 -14 Z" fill="#2b2b2b" />
      <ellipse cx="45" cy="112" rx="13" ry="3" fill="#6fe06f" opacity="0.9">
        <animate attributeName="ry" values="3;4;3" dur="2s" repeatCount="indefinite" />
      </ellipse>
      <circle cx="40" cy="108" r="1.5" fill="#9bf09b">
        <animate attributeName="cy" values="108;100;108" dur="2.6s" repeatCount="indefinite" />
      </circle>
      {/* green-pallor face, long black hair */}
      <path d="M28 20 q-4 34 6 44 l22 0 q10 -10 6 -44 Z" fill="#1d1d24" />
      <circle cx="45" cy="38" r="12" fill="#b8c98a" />
      <path d="M39 44 q6 4 12 0" stroke="#5a6b3a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="41" cy="35" r="1.8" fill="#1d1d24" />
      <circle cx="50" cy="35" r="1.8" fill="#1d1d24" />
      <path d="M44 38 l3 4 l-4 1" stroke="#5a6b3a" strokeWidth="1.5" fill="none" />
    </g>
  ),
  knight: (
    <g>
      {/* plate legs */}
      <path d="M34 92 l-2 28 h10 l2 -26 Z" fill="#8a8f98" />
      <path d="M56 92 l2 28 h-10 l-2 -26 Z" fill="#767b84" />
      {/* cuirass */}
      <path d="M30 58 q15 -8 30 0 l-2 36 q-13 6 -26 0 Z" fill="#9aa0aa" />
      <path d="M30 58 q15 -8 30 0 l-1 8 q-14 -6 -28 0 Z" fill="#b2b8c2" />
      <path d="M44 60 v32" stroke="#6b7078" strokeWidth="2" />
      {/* arm with sword planted */}
      <path d="M60 64 q14 4 14 18 l-6 2 q-1 -10 -10 -13 Z" fill="#8a8f98" />
      <rect x="70" y="82" width="5" height="34" fill="#c9ced6" />
      <rect x="64" y="80" width="17" height="4" fill="#d4af37" />
      <rect x="70" y="116" width="5" height="6" fill="#d4af37" />
      <path d="M30 64 q-12 4 -12 18 l6 2 q1 -10 8 -13 Z" fill="#767b84" />
      {/* great helm, visor rusted shut */}
      <path d="M33 22 h24 v22 q0 8 -12 8 q-12 0 -12 -8 Z" fill="#9aa0aa" />
      <path d="M33 22 h24 v6 h-24 Z" fill="#b2b8c2" />
      <rect x="35" y="33" width="20" height="3" fill="#2b2b2b" />
      <path d="M35 40 h20" stroke="#8a5a2a" strokeWidth="3" strokeDasharray="2 2" />
      <path d="M45 14 l0 8 M45 14 q8 -6 12 0 q-6 2 -12 0" fill="#8f1a1a" stroke="#8f1a1a" strokeWidth="2" />
    </g>
  ),
  ghost: (
    <g opacity="0.75">
      <path d="M25 118 q-4 -60 20 -92 q24 32 20 92 q-5 -8 -10 0 q-5 -8 -10 0 q-5 -8 -10 0 q-5 -8 -10 0 Z" fill="#dfe6ee" opacity="0.8">
        <animate attributeName="opacity" values="0.75;0.9;0.75" dur="3.5s" repeatCount="indefinite" />
      </path>
      <circle cx="38" cy="52" r="3.5" fill="#44506a" />
      <circle cx="52" cy="52" r="3.5" fill="#44506a" />
      <ellipse cx="45" cy="66" rx="4" ry="6" fill="#44506a" />
      {/* faint chain */}
      <path d="M28 96 q-8 6 -14 4" stroke="#b8c2cf" strokeWidth="3" strokeDasharray="4 3" fill="none" opacity="0.6" />
    </g>
  ),
  cat: (
    <g>
      {/* sitting cat, lower third */}
      <path d="M34 122 q-4 -26 10 -34 q16 -6 20 10 q3 12 1 24 Z" fill="#2b2b30" />
      <path d="M64 100 q10 2 8 14 q-1 8 -8 8" fill="none" stroke="#2b2b30" strokeWidth="6" strokeLinecap="round" />
      <circle cx="42" cy="82" r="11" fill="#2b2b30" />
      <path d="M34 76 l-3 -10 l9 5 Z M50 76 l3 -10 l-9 5 Z" fill="#2b2b30" />
      <circle cx="38" cy="81" r="2" fill="#d4af37" />
      <circle cx="46" cy="81" r="2" fill="#d4af37" />
      <path d="M40 86 q2 2 4 0" stroke="#d4af37" strokeWidth="1.2" fill="none" />
      <path d="M30 84 l-8 -1 M30 87 l-8 2 M54 84 l8 -1 M54 87 l8 2" stroke="#6b6b70" strokeWidth="1" />
      <ellipse cx="45" cy="124" rx="18" ry="3" fill="#000" opacity="0.4" />
    </g>
  ),
  wizard: (
    <g>
      {/* starry blue robe */}
      <path d="M32 54 q13 -6 26 0 q10 32 8 64 h-42 q-2 -32 8 -64 Z" fill="#2a3a6a" />
      <circle cx="38" cy="78" r="1.5" fill="#d4af37" />
      <circle cx="54" cy="90" r="1.5" fill="#d4af37" />
      <circle cx="44" cy="104" r="1.5" fill="#d4af37" />
      <path d="M36 54 q9 -4 18 0 l-1 8 q-8 -3 -16 0 Z" fill="#3a4c82" />
      {/* staff with glow */}
      <rect x="68" y="52" width="4" height="66" fill="#6b4f2a" />
      <circle cx="70" cy="48" r="6" fill="#8fd0e8">
        <animate attributeName="r" values="5.5;7;5.5" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <path d="M60 66 q8 0 10 -10 l-4 -2 q-2 8 -8 8 Z" fill="#2a3a6a" />
      {/* beard + face */}
      <path d="M34 44 q-2 22 11 26 q13 -4 11 -26 Z" fill="#d8d8d8" />
      <circle cx="45" cy="38" r="11" fill={skin} />
      <circle cx="41" cy="36" r="1.8" fill="#2b1a0e" />
      <circle cx="49" cy="36" r="1.8" fill="#2b1a0e" />
      {/* tall pointed hat */}
      <path d="M28 32 q17 -8 34 0 l-14 -28 Z" fill="#2a3a6a" />
      <path d="M28 32 q17 -8 34 0 l-1 4 q-16 -7 -32 0 Z" fill="#3a4c82" />
      <path d="M44 14 l2 3 l3 0 l-2 3 l1 3 l-3 -2 l-3 2 l1 -3 l-2 -3 l3 0 Z" fill="#d4af37" />
    </g>
  ),
  alchemist: (
    <g>
      {/* leather apron over tunic */}
      <path d="M32 56 q13 -5 26 0 l-3 60 h-20 Z" fill="#6b4f2a" />
      <path d="M38 62 h14 v24 h-14 Z" fill="#8a6a3a" />
      <path d="M30 58 q-10 6 -8 18 l5 1 q1 -9 7 -13 Z" fill="#5a4230" />
      {/* raised flask, bubbling */}
      <path d="M60 60 q12 -2 14 -14 l-5 -2 q-2 9 -11 10 Z" fill="#5a4230" />
      <path d="M72 30 l4 0 l0 8 q7 4 6 11 q-1 6 -8 6 q-7 0 -8 -6 q-1 -7 6 -11 Z" fill="#9bd4b8" opacity="0.85" />
      <circle cx="74" cy="49" r="1.5" fill="#e8ffe8">
        <animate attributeName="cy" values="49;41;49" dur="1.8s" repeatCount="indefinite" />
      </circle>
      {/* goggles up on forehead */}
      <circle cx="45" cy="40" r="12" fill={skin} />
      <circle cx="40" cy="31" r="4" fill="#b8a86a" stroke="#6b5a2a" strokeWidth="1.5" />
      <circle cx="50" cy="31" r="4" fill="#b8a86a" stroke="#6b5a2a" strokeWidth="1.5" />
      <path d="M36 44 q9 6 18 0" stroke="#7a4a2a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="41" cy="39" r="1.8" fill="#2b1a0e" />
      <circle cx="50" cy="39" r="1.8" fill="#2b1a0e" />
      {/* singed hair */}
      <path d="M34 30 q2 -8 8 -9 M56 30 q-2 -8 -8 -9 M45 20 l0 -5 M40 22 l-2 -5 M50 22 l2 -5" stroke="#4a3a2a" strokeWidth="2" strokeLinecap="round" fill="none" />
    </g>
  ),
  queen: (
    <g>
      {/* regal gown */}
      <path d="M32 56 q13 -6 26 0 q12 34 10 64 h-46 q-2 -30 10 -64 Z" fill="#6d1b4a" />
      <path d="M45 56 v64" stroke="#8a2a5e" strokeWidth="3" />
      <path d="M32 56 q13 -6 26 0 l-2 10 q-11 -5 -22 0 Z" fill="#8a2a5e" />
      {/* ermine trim */}
      <path d="M22 120 h46 v-6 q-23 -4 -46 0 Z" fill="#f1e9d2" />
      <circle cx="30" cy="117" r="1.2" fill="#2b2b2b" />
      <circle cx="45" cy="116" r="1.2" fill="#2b2b2b" />
      <circle cx="60" cy="117" r="1.2" fill="#2b2b2b" />
      {/* folded arms */}
      <path d="M30 66 q-8 6 -6 16 q10 4 21 2 l0 -6 q-9 1 -15 -2 q-2 -6 0 -10 Z" fill="#6d1b4a" />
      <path d="M60 66 q8 6 6 16 q-10 4 -21 2 l0 -6 q9 1 15 -2 q2 -6 0 -10 Z" fill="#5c1640" />
      {/* face + coif */}
      <circle cx="45" cy="40" r="12" fill={skin} />
      <path d="M33 36 q0 -14 12 -14 q12 0 12 14 l-4 0 q0 -10 -8 -10 q-8 0 -8 10 Z" fill="#8a6a3a" />
      <circle cx="41" cy="38" r="1.8" fill="#2b1a0e" />
      <circle cx="50" cy="38" r="1.8" fill="#2b1a0e" />
      <path d="M40 46 q5 3 10 0" stroke={skinShade} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* crown */}
      <path d="M33 26 l3 -10 l6 7 l3 -9 l3 9 l6 -7 l3 10 Z" fill="#d4af37" stroke="#9a7b1f" strokeWidth="1.5" />
      <circle cx="36" cy="15" r="2" fill="#8f1a1a" />
      <circle cx="45" cy="13" r="2" fill="#2a5db0" />
      <circle cx="54" cy="15" r="2" fill="#8f1a1a" />
    </g>
  ),
}
