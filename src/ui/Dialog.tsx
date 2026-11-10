import { ReactNode } from 'react'

interface DialogProps {
  title: string
  onClose: () => void
  children: ReactNode
  width?: number
}

/** Custom-drawn dialog, parchment over a dimmed backdrop. Standard browser
 *  dialogs would stand out like a sore thumb — which is period-accurate,
 *  but we only allow that for file pickers. */
export function Dialog({ title, onClose, children, width }: DialogProps) {
  return (
    <div className="e-dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="e-dialog" style={width ? { width } : undefined} role="dialog" aria-label={title}>
        <div className="e-dialog-title">
          <span>{title}</span>
          <button onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="e-dialog-body">{children}</div>
      </div>
    </div>
  )
}
