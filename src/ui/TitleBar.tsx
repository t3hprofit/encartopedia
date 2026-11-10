import { useState } from 'react'
import { AboutDialog } from '../features/about/AboutDialog'
import { Dialog } from '../ui/Dialog'

export function TitleBar() {
  const [about, setAbout] = useState(false)
  const [closing, setClosing] = useState(false)

  return (
    <div className="e-titlebar">
      <span className="e-titlebar-name">E N C A R T O P E D I A</span>
      <button className="e-info" title="About Encartopedia" onClick={() => setAbout(true)}>
        i
      </button>
      <button title="Minimize" onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})}>
        ▁
      </button>
      <button
        title="Maximize"
        onClick={() =>
          document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.().catch(() => {})
        }
      >
        ▢
      </button>
      <button title="Close" onClick={() => setClosing(true)}>
        ✕
      </button>
      {about && <AboutDialog onClose={() => setAbout(false)} />}
      {closing && (
        <Dialog title="Exit Encartopedia" onClose={() => setClosing(false)}>
          <p>It is now safe to close this tab.</p>
          <p style={{ color: 'var(--e-ink-soft)' }}>
            (Being a web page, Encartopedia cannot close itself — how times change.)
          </p>
          <button className="e-btn" onClick={() => setClosing(false)}>
            Return to the Encyclopedia
          </button>
        </Dialog>
      )}
    </div>
  )
}
