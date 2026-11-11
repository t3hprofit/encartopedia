import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AboutDialog } from '../features/about/AboutDialog'
import { Dialog } from '../ui/Dialog'

export function TitleBar() {
  const navigate = useNavigate()
  const [about, setAbout] = useState(false)
  const [closing, setClosing] = useState(false)

  return (
    <div className="e-titlebar">
      <button className="e-titlebar-name" title="Return to the Introduction" onClick={() => navigate('/w')}>
        E N C A R T O P E D I A
      </button>
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
