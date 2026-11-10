import { ReactNode, useEffect, useRef, useState } from 'react'
import { playClick } from '../sfx/audio'

interface PullDownProps {
  label: ReactNode
  /** '▼' select-style or '▸' menu-style trigger */
  kind?: 'select' | 'menu'
  buttonClass?: string
  menuClass?: string
  children: (close: () => void) => ReactNode
}

/** A toolbar pull-down. Encarta drew its own menus — so do we. */
export function PullDown({ label, kind = 'select', buttonClass = '', menuClass = '', children }: PullDownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="e-pulldown" ref={ref}>
      <button
        className={`e-btn ${kind === 'select' ? 'e-dd-trigger' : 'e-mn-trigger'} ${buttonClass}`}
        onClick={() => {
          playClick()
          setOpen((o) => !o)
        }}
      >
        {label}
      </button>
      {open && <div className={`e-menu ${menuClass}`}>{children(() => setOpen(false))}</div>}
    </div>
  )
}
