import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { TitleBar } from '../ui/TitleBar'
import { PullDown } from '../ui/PullDown'
import { Dialog } from '../ui/Dialog'
import { AREAS } from '../theme/areas'
import { AtlasIcon, GalleryIcon, MindMazeIcon, TimelineIcon } from './FeatureIcons'
import { Pinpointer } from '../features/pinpointer/Pinpointer'
import { ToolsHost } from '../features/tools/ToolsHost'
import { playClick } from '../sfx/audio'
import './shell.css'

export interface ShellContext {
  openPinpointer: () => void
}

function isEditable(el: EventTarget | null): boolean {
  const t = el as HTMLElement | null
  return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
}

export function Shell() {
  const navigate = useNavigate()
  const [pinpointerOpen, setPinpointerOpen] = useState(false)
  const [notYet, setNotYet] = useState<string | null>(null)
  const [areaId, setAreaId] = useState<string>(AREAS[0].id)
  const area = AREAS.find((a) => a.id === areaId) ?? AREAS[0]

  // Easter egg: Ctrl+Z summons MindMaze (how later editions hid the launch).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'z' && !isEditable(e.target)) {
        e.preventDefault()
        navigate('/w/mindmaze')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  const go = (to: string, close: () => void) => {
    playClick()
    close()
    navigate(to)
  }

  return (
    <div className="e-app">
      <TitleBar />
      <div className="e-toolbar">
        <PullDown label="Area of Interest" kind="select">
          {(close) => (
            <>
              {AREAS.map((a) => (
                <button
                  key={a.id}
                  className="e-menu-item"
                  style={a.id === areaId ? { background: a.accent, color: a.accentText } : undefined}
                  onClick={() => {
                    setAreaId(a.id)
                    go(`/w/browse/${a.id}`, close)
                  }}
                >
                  <span className="accent" style={{ background: a.accent }} />
                  {a.label}
                </button>
              ))}
            </>
          )}
        </PullDown>
        <PullDown label="Category" kind="select">
          {(close) => (
            <>
              {area.subcategories.map((s, i) => (
                <button key={s.label} className="e-menu-item" onClick={() => go(`/w/browse/${area.id}/${i}`, close)}>
                  {s.label}
                </button>
              ))}
            </>
          )}
        </PullDown>
        <button
          className="e-btn dark"
          onClick={() => {
            playClick()
            setPinpointerOpen(true)
          }}
        >
          Find
        </button>
        <button
          className="e-btn"
          onClick={() => {
            playClick()
            navigate(-1)
          }}
        >
          Go Back
        </button>
        <span className="spacer" />
        <PullDown label="Features" kind="menu" menuClass="black right">
          {(close) => (
            <>
              <button className="e-menu-item" onClick={() => go('/w/atlas', close)}>
                <AtlasIcon /> Atlas
              </button>
              <button className="e-menu-item" onClick={() => go('/w/gallery', close)}>
                <GalleryIcon /> Media Gallery
              </button>
              <button className="e-menu-item" onClick={() => go('/w/timeline', close)}>
                <TimelineIcon /> Timeline
              </button>
              <button className="e-menu-item" onClick={() => go('/w/mindmaze', close)}>
                <MindMazeIcon /> MindMaze
              </button>
            </>
          )}
        </PullDown>
        <PullDown label="Tools" kind="menu" menuClass="right">
          {(close) => (
            <>
              {['Browse Panel', 'Dictionary Thesaurus', 'Notemark', 'Back List', 'Word Processor'].map((t) => (
                <button
                  key={t}
                  className="e-menu-item"
                  onClick={() => {
                    close()
                    // Tools land in Phase 6; each listens for this event when implemented.
                    const handled = window.dispatchEvent(new CustomEvent('e-tool', { detail: t, cancelable: true }))
                    if (handled) setNotYet(t)
                  }}
                >
                  {t}
                </button>
              ))}
            </>
          )}
        </PullDown>
      </div>
      <div className="e-content">
        <div className="e-page">
          <Outlet context={{ openPinpointer: () => setPinpointerOpen(true) } satisfies ShellContext} />
        </div>
      </div>
      <ToolsHost />
      {pinpointerOpen && <Pinpointer onClose={() => setPinpointerOpen(false)} />}
      {notYet && (
        <Dialog title={notYet} onClose={() => setNotYet(null)}>
          <p>This feature is being pressed onto the disc. Check back in a later build.</p>
        </Dialog>
      )}
    </div>
  )
}
