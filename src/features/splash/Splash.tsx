import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog } from '../../ui/Dialog'
import { playFanfare } from '../../sfx/audio'
import './splash.css'

const SKIP_KEY = 'encartopedia.skipSplash'
export const shouldSkipSplash = () => localStorage.getItem(SKIP_KEY) === '1'

/** The golden filmstrip spiraling into a classical face, drawn as original SVG art. */
function GoldenFace() {
  const frames = Array.from({ length: 9 }, (_, i) => i)
  return (
    <svg viewBox="0 0 400 340" style={{ width: 'min(52vmin, 420px)', opacity: 0.96 }}>
      <defs>
        <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4e3a1" />
          <stop offset="0.5" stopColor="#d4af37" />
          <stop offset="1" stopColor="#8a6d1d" />
        </linearGradient>
      </defs>
      {/* spiraling filmstrip ribbon */}
      <path
        d="M30 300 C 70 210, 110 150, 190 130 C 270 110, 330 150, 330 210 C 330 265, 280 290, 230 275"
        fill="none"
        stroke="url(#gold)"
        strokeWidth="34"
        strokeLinecap="round"
      />
      {frames.map((i) => {
        const t = i / (frames.length - 1)
        // sample points roughly along the ribbon
        const x = 30 + 200 * t + 60 * Math.sin(t * Math.PI)
        const y = 300 - 170 * t + 40 * Math.sin(t * Math.PI * 1.4)
        return <rect key={i} x={x - 7} y={y - 10} width="14" height="20" fill="#2b2410" opacity="0.65" rx="1.5" />
      })}
      {/* classical golden profile */}
      <path
        d="M215 70
           C 250 55, 290 70, 300 110
           C 306 134, 300 150, 290 162
           C 296 170, 296 178, 288 182
           C 292 190, 288 198, 278 198
           C 280 212, 268 222, 250 218
           C 240 240, 210 244, 196 228
           C 170 236, 150 218, 154 196
           C 136 184, 136 156, 152 142
           C 150 100, 178 74, 215 70 Z"
        fill="url(#gold)"
        stroke="#8a6d1d"
        strokeWidth="2"
      />
      <path d="M262 128 a7 4 0 1 0 14 0 a7 4 0 1 0 -14 0" fill="#5c4812" />
      <path d="M284 150 q10 6 2 14" fill="none" stroke="#8a6d1d" strokeWidth="3" strokeLinecap="round" />
      <path d="M266 180 q10 2 16 -2" fill="none" stroke="#8a6d1d" strokeWidth="3" strokeLinecap="round" />
      {/* laurel hint */}
      <path d="M190 84 q-16 10 -18 30 M206 76 q-20 8 -26 26" fill="none" stroke="#8a6d1d" strokeWidth="3" strokeLinecap="round" />
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
          ENCARTOPEDIA &rsquo;95
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
