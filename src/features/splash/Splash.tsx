import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog } from '../../ui/Dialog'
import { playFanfare } from '../../sfx/audio'
import './splash.css'

const SKIP_KEY = 'encartopedia.skipSplash'
export const shouldSkipSplash = () => localStorage.getItem(SKIP_KEY) === '1'

/** One frame of the filmstrip: dark border, sprocket holes, a tiny scene. */
function FilmFrame({
  x,
  y,
  rotate,
  title,
  children,
}: {
  x: number
  y: number
  rotate: number
  title: string
  children: React.ReactNode
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <title>{title}</title>
      <rect x="-21" y="-17" width="42" height="34" rx="2" fill="#2b2410" stroke="#8a6d1d" strokeWidth="1.2" />
      {[-14, 0, 14].map((hx) => (
        <g key={hx} fill="#d4af37" opacity="0.8">
          <rect x={hx - 2.2} y="-15" width="4.4" height="3" rx="0.8" />
          <rect x={hx - 2.2} y="12" width="4.4" height="3" rx="0.8" />
        </g>
      ))}
      <g transform="translate(0 0.5)">
        <rect x="-17" y="-10" width="34" height="21" fill="#10131c" />
        {children}
      </g>
    </g>
  )
}

/** The golden filmstrip spiraling into a classical face, drawn as original SVG art. */
function GoldenFace() {
  return (
    <svg viewBox="0 0 400 340" style={{ width: 'min(52vmin, 420px)', opacity: 0.97 }}>
      <defs>
        <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4e3a1" />
          <stop offset="0.5" stopColor="#d4af37" />
          <stop offset="1" stopColor="#8a6d1d" />
        </linearGradient>
        <linearGradient id="goldFace" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0dc94" />
          <stop offset="0.55" stopColor="#d9b63f" />
          <stop offset="1" stopColor="#a1822a" />
        </linearGradient>
        <radialGradient id="halo" cx="0.5" cy="0.45" r="0.5">
          <stop offset="0" stopColor="#fff3c4" stopOpacity="0.85" />
          <stop offset="0.55" stopColor="#f4e3a1" stopOpacity="0.35" />
          <stop offset="1" stopColor="#f4e3a1" stopOpacity="0" />
        </radialGradient>
        {/* a band of light that sweeps along the ribbon */}
        <linearGradient id="shimmer" x1="-0.3" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff8dc" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
          <animate attributeName="x1" values="-0.3;1" dur="5.5s" repeatCount="indefinite" />
          <animate attributeName="x2" values="0;1.3" dur="5.5s" repeatCount="indefinite" />
        </linearGradient>
      </defs>

      {/* radiant halo + sun rays behind everything */}
      <circle cx="205" cy="165" r="165" fill="url(#halo)" />
      <g stroke="#f4e3a1" strokeWidth="3" strokeLinecap="round" opacity="0.5">
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * Math.PI) / 6 + 0.26
          const inner = 128
          const outer = i % 2 ? 150 : 166
          return (
            <line
              key={i}
              x1={205 + inner * Math.cos(a)}
              y1={165 + inner * Math.sin(a)}
              x2={205 + outer * Math.cos(a)}
              y2={165 + outer * Math.sin(a)}
            />
          )
        })}
      </g>
      {/* faint medallion ring */}
      <circle cx="205" cy="165" r="140" fill="none" stroke="#c9a227" strokeWidth="1.5" opacity="0.4" />

      {/* filmstrip ribbon — right tail first (behind the head) */}
      {/* dark perforation dashes peek out from under the gold band at both edges */}
      <path
        d="M292 96 C 346 118, 368 176, 348 230 C 332 272, 288 288, 248 272"
        fill="none"
        stroke="#6b5415"
        strokeWidth="42"
        strokeLinecap="round"
        strokeDasharray="4 9"
        opacity="0.9"
      />
      <path
        d="M292 96 C 346 118, 368 176, 348 230 C 332 272, 288 288, 248 272"
        fill="none"
        stroke="url(#gold)"
        strokeWidth="34"
        strokeLinecap="round"
      />
      <path
        d="M292 96 C 346 118, 368 176, 348 230 C 332 272, 288 288, 248 272"
        fill="none"
        stroke="url(#shimmer)"
        strokeWidth="34"
        strokeLinecap="round"
      />
      {/* left sweep rising into the face */}
      <path
        d="M30 306 C 66 230, 118 176, 196 148"
        fill="none"
        stroke="#6b5415"
        strokeWidth="42"
        strokeLinecap="round"
        strokeDasharray="4 9"
        opacity="0.9"
      />
      <path
        d="M30 306 C 66 230, 118 176, 196 148"
        fill="none"
        stroke="url(#gold)"
        strokeWidth="34"
        strokeLinecap="round"
      />
      <path
        d="M30 306 C 66 230, 118 176, 196 148"
        fill="none"
        stroke="url(#shimmer)"
        strokeWidth="34"
        strokeLinecap="round"
      />

      {/* ---- classical golden profile, facing left ---- */}
      {/* neck + shoulder drape */}
      <path d="M212 220 q-4 32 -14 44 q40 14 76 2 q-10 -34 -8 -62 Z" fill="url(#goldFace)" stroke="#8a6d1d" strokeWidth="2" />
      <path d="M198 262 q40 16 78 2 l8 20 q-48 18 -94 0 Z" fill="url(#gold)" stroke="#8a6d1d" strokeWidth="2" />
      {/* head: forehead → straight Greek nose → lips → chin → jaw → back of skull */}
      <path
        d="M247 54
           C 215 50, 188 66, 178 96
           L 160 148
           C 158 153, 160 157, 166 157
           L 174 157
           C 171 162, 172 166, 178 167
           C 174 172, 175 177, 182 178
           C 178 185, 181 192, 191 193
           C 193 206, 203 216, 218 219
           C 248 226, 280 214, 292 188
           C 306 157, 304 112, 288 84
           C 278 64, 264 56, 247 54 Z"
        fill="url(#goldFace)"
        stroke="#8a6d1d"
        strokeWidth="2.5"
      />
      {/* cheek + jaw shading */}
      <path d="M196 170 q10 22 26 26 q-4 8 -14 6 q-10 -10 -12 -32" fill="#b8952e" opacity="0.5" />
      {/* sculpted highlights: forehead sheen + crown sheen only, kept soft */}
      <path d="M186 78 q-14 14 -17 34 q8 -4 12 -12 q4 -12 5 -22" fill="#fff3c4" opacity="0.4" />
      <path d="M244 72 q18 12 24 36 q-8 -4 -14 -14 q-6 -12 -10 -22" fill="#fff3c4" opacity="0.3" />
      {/* serene closed eye + brow */}
      <path d="M176 112 q12 -7 24 -1" fill="none" stroke="#8a6d1d" strokeWidth="3" strokeLinecap="round" />
      <path d="M180 124 q10 6 19 1" fill="none" stroke="#6b5415" strokeWidth="3" strokeLinecap="round" />
      <path d="M184 128 l-2 4 M190 129 l-1 4 M196 128 l0 4" stroke="#6b5415" strokeWidth="1.6" strokeLinecap="round" />
      {/* nostril, lips, chin crease */}
      <path d="M168 152 q4 3 8 2" fill="none" stroke="#8a6d1d" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M178 167 q8 3 14 0" fill="none" stroke="#8a6d1d" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M181 178 q7 4 13 1" fill="none" stroke="#8a6d1d" strokeWidth="2.2" strokeLinecap="round" />
      {/* ear */}
      <path d="M258 136 a11 15 0 1 0 4 29 M259 146 a5 7 0 1 0 2 13" fill="none" stroke="#8a6d1d" strokeWidth="2.6" />
      {/* classical curls across the crown */}
      <path
        d="M178 96 q-4 -26 18 -38 q26 -16 54 -2 q22 10 28 34
           q-8 -10 -20 -12 q4 10 0 18 q-8 -12 -20 -14 q2 10 -4 16 q-6 -12 -18 -13 q0 10 -7 14 q-4 -12 -15 -12 q-2 9 -8 12 q-3 -9 -8 -3 Z"
        fill="#c9a227"
        stroke="#8a6d1d"
        strokeWidth="2"
      />
      <path d="M186 70 q10 -10 24 -10 M206 58 q14 -4 28 2 M240 58 q12 4 18 14" fill="none" stroke="#8a6d1d" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
      {/* laurel sprig tucked along the hairline */}
      <g stroke="#6e7d3a" strokeWidth="2.4" fill="#8a9a4a" strokeLinecap="round">
        <path d="M176 102 q-6 -30 26 -46" fill="none" />
        {(
          [
            [174, 92, -32],
            [178, 77, -56],
            [189, 64, -80],
            [203, 57, -102],
          ] as const
        ).map(([cx, cy, r]) => (
          <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx="8" ry="3.4" transform={`rotate(${r} ${cx} ${cy})`} />
        ))}
        <circle cx="174" cy="101" r="3" fill="#8f1a1a" stroke="none" />
      </g>

      {/* ---- filmstrip frames: the disc's greatest hits ---- */}
      <FilmFrame x={54} y={282} rotate={-40} title="The Space Shuttle — obligatory">
        <rect x="-17" y="-10" width="34" height="21" fill="#0c1430" />
        <path d="M-2 7 L1 -7 q1.5 -3 3 0 L7 7 Z" fill="#e8e8f0" />
        <path d="M-2 4 l-6 4 l6 -1 M7 4 l6 4 l-6 -1" fill="#c0c0cc" />
        <path d="M0 8 q2 4 5 0" fill="none" stroke="#e8a33c" strokeWidth="2" />
        <circle cx="-10" cy="-5" r="1" fill="#fff" />
        <circle cx="12" cy="-3" r="0.8" fill="#fff" />
      </FilmFrame>
      <FilmFrame x={98} y={236} rotate={-36} title="Saturn">
        <rect x="-17" y="-10" width="34" height="21" fill="#0a0a18" />
        <circle cx="0" cy="0" r="6" fill="#d8b36a" />
        <ellipse cx="0" cy="0" rx="13" ry="3.6" fill="none" stroke="#e8d49a" strokeWidth="1.6" transform="rotate(-18)" />
        <circle cx="-12" cy="-6" r="0.8" fill="#fff" />
        <circle cx="12" cy="6" r="0.8" fill="#fff" />
      </FilmFrame>
      <FilmFrame x={146} y={198} rotate={-28} title="A certain smile">
        <rect x="-17" y="-10" width="34" height="21" fill="#2a2416" />
        <path d="M-4 9 q-2 -8 0 -12 q1.5 -4 4 -4 q2.5 0 4 4 q2 4 0 12 Z" fill="#d8b88a" />
        <path d="M-4 -2 q4 -5 8 0 q0 -6 -4 -6 q-4 0 -4 6" fill="#3a2a14" />
        <path d="M-1.5 3.5 q1.5 1.2 3 0" fill="none" stroke="#6b4a2a" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M-7 9 q7 3 14 0" fill="none" stroke="#5a4a6a" strokeWidth="2" />
      </FilmFrame>
      <FilmFrame x={352} y={160} rotate={78} title="Giza">
        <rect x="-17" y="-10" width="34" height="21" fill="#1c2a3e" />
        <path d="M-14 8 L-3 -6 L8 8 Z" fill="#c9a86a" />
        <path d="M-3 -6 L-1 8 L8 8 Z" fill="#a1823e" />
        <circle cx="10" cy="-5" r="3" fill="#e8c45c" />
      </FilmFrame>
      <FilmFrame x={338} y={238} rotate={48} title="The double helix">
        <rect x="-17" y="-10" width="34" height="21" fill="#101c18" />
        <path d="M-10 -8 q6 8 0 16 M-2 -8 q-6 8 0 16" fill="none" stroke="#6fd0a8" strokeWidth="1.6" />
        <path d="M-9 -4 h6 M-10 0 h8 M-9 4 h6" stroke="#9be8c8" strokeWidth="1.1" />
        <path d="M6 -8 q6 8 0 16 M14 -8 q-6 8 0 16" fill="none" stroke="#6fd0a8" strokeWidth="1.6" />
        <path d="M7 -4 h6 M6 0 h8 M7 4 h6" stroke="#9be8c8" strokeWidth="1.1" />
      </FilmFrame>
      <FilmFrame x={282} y={286} rotate={18} title="One frame from 2026">
        <rect x="-17" y="-10" width="34" height="21" fill="#1a1612" />
        {/* a small coral asterisk, for the assistants */}
        <g stroke="#d97757" strokeWidth="2.6" strokeLinecap="round">
          <path d="M0 -7 L0 7 M-6.1 -3.5 L6.1 3.5 M-6.1 3.5 L6.1 -3.5" />
        </g>
      </FilmFrame>
      <FilmFrame x={36} y={300} rotate={-46} title="The mammoth sends regards">
        <rect x="-17" y="-10" width="34" height="21" fill="#2a3444" />
        <path d="M-14 8 h28 M-12 8 q-2 -10 6 -13 q10 -4 14 4 q3 5 2 9 M-10 8 v-4 M-4 8 v-5 M4 8 v-5 M8 8 v-4" stroke="#c9b08a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M-12 -2 q-5 2 -4 8" stroke="#e8d9b0" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <circle cx="4" cy="-3" r="0.9" fill="#e8d9b0" />
      </FilmFrame>
      <FilmFrame x={318} y={112} rotate={64} title="The dance">
        <rect x="-17" y="-10" width="34" height="21" fill="#2a1a2e" />
        <g fill="#f0dcc8">
          <circle cx="-1" cy="-6" r="2.2" />
          <path d="M-2.5 -4 q-3 4 -1 8 l3 0 q2 -4 1 -8 Z" />
          <path d="M-3 4 q-5 3 -8 1 M0 4 q3 4 7 4" stroke="#f0dcc8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M-3.5 -2 q-5 -2 -8 -6 M-0.5 -2.5 q4 -3 5 -7" stroke="#f0dcc8" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M-5 2 q4 3 8 0 q-1 4 -4 4 q-3 0 -4 -4 Z" fill="#c8687a" />
        </g>
      </FilmFrame>

      {/* sparkles */}
      {(
        [
          [96, 120, 0],
          [330, 60, 0.8],
          [368, 120, 1.6],
          [60, 200, 2.4],
          [236, 36, 1.2],
          [352, 290, 2.0],
        ] as const
      ).map(([sx, sy, delay]) => (
        <g key={`${sx}-${sy}`} transform={`translate(${sx} ${sy})`} fill="#fff8dc">
          <path d="M0 -7 Q1.3 -1.3 7 0 Q1.3 1.3 0 7 Q-1.3 1.3 -7 0 Q-1.3 -1.3 0 -7 Z">
            <animate attributeName="opacity" values="0.15;1;0.15" dur="3.2s" begin={`${delay}s`} repeatCount="indefinite" />
          </path>
        </g>
      ))}
    </svg>
  )
}

const HIGHLIGHTS: Record<string, string> = {
  'World of Encartopedia':
    'Every article in the English Wikipedia — over six million of them — pressed onto a single, infinitely large compact disc called the internet. Browse nine Areas of Interest, or let the Pinpointer find anything.',
  'Getting Around':
    'Use the Area of Interest and Category menus to browse. Click Find to open the Pinpointer. Red words in articles are links — click them. The Features menu holds the Atlas, Media Gallery, Timeline, and MindMaze. Press Ctrl+Z if you know what is good for you.',
  'Research & Reports':
    'Copy any article text into your report (teachers love that). Every article links back to its Wikipedia source, licensed CC BY-SA 4.0 — cite it properly, unlike in 1995.',
}

export function Splash() {
  const navigate = useNavigate()
  const [highlight, setHighlight] = useState<string | null>(null)
  const [skip, setSkip] = useState(shouldSkipSplash())

  const enter = () => {
    playFanfare()
    // let the fanfare begin before the view swaps
    setTimeout(() => navigate('/w'), 650)
  }

  return (
    <div className="e-splash">
      <div className="e-splash-sky">
        <div className="e-cloud" style={{ top: '12%', left: '8%', width: 180, height: 48 }} />
        <div className="e-cloud" style={{ top: '28%', right: '12%', width: 240, height: 60 }} />
        <div className="e-cloud" style={{ top: '62%', left: '18%', width: 150, height: 40 }} />
        <div className="e-cloud" style={{ top: '8%', right: '34%', width: 120, height: 34 }} />
        <div className="e-splash-face">
          <GoldenFace />
        </div>
      </div>
      <div className="e-splash-banner">
        <div className="e-splash-title">
          <small>THE COMPLETE INTERACTIVE MULTIMEDIA ENCYCLOPEDIA</small>
          ENCARTOPEDIA <span className="e-splash-struck">&rsquo;95</span>{' '}
          <span className="e-splash-updated">
            &rsquo;26
            <svg className="e-splash-rays" viewBox="0 0 40 40" aria-hidden>
              {/* three rays fanning out from the numeral's shoulder */}
              <g stroke="#f4e3a1" strokeWidth="3.5" strokeLinecap="round" fill="none">
                <line x1="5" y1="28" x2="5" y2="8" />
                <line x1="13" y1="29" x2="27" y2="15" />
                <line x1="16" y1="37" x2="36" y2="37" />
              </g>
            </svg>
          </span>
        </div>
        <button className="e-enter" onClick={enter}>
          Enter ▶
        </button>
        <div className="e-splash-foot">
          <label className="e-splash-check">
            <input
              type="checkbox"
              checked={!skip}
              onChange={(e) => {
                const show = e.target.checked
                setSkip(!show)
                localStorage.setItem(SKIP_KEY, show ? '0' : '1')
              }}
            />
            Display this screen in the future
          </label>
          <div className="e-highlights">
            {Object.keys(HIGHLIGHTS).map((h) => (
              <button key={h} className="e-highlight-btn" onClick={() => setHighlight(h)}>
                ✦ {h}
              </button>
            ))}
          </div>
        </div>
      </div>
      {highlight && (
        <Dialog title={highlight} onClose={() => setHighlight(null)}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: 14 }}>{HIGHLIGHTS[highlight]}</p>
        </Dialog>
      )}
    </div>
  )
}
