import { useState } from 'react'
import { Dialog } from '../../ui/Dialog'
import { getConsent, setConsent, Consent } from '../../lib/analytics'
import { GA_MEASUREMENT_ID } from '../../config'

/** The world-and-books picture in the About box. Shift+Ctrl+right-click it
 *  to reveal the "development team photo" — the real Encarta '95 easter egg. */
function AboutPicture() {
  const [team, setTeam] = useState(false)

  return (
    <div
      onContextMenu={(e) => {
        if (e.shiftKey && e.ctrlKey) {
          e.preventDefault()
          setTeam(true)
        }
      }}
      style={{ cursor: 'default', flex: 'none' }}
      title={team ? 'The Encartopedia development team' : undefined}
    >
      {team ? (
        <svg width="120" height="90" viewBox="0 0 120 90" style={{ border: '1px solid #7e7152', background: '#2b2b40' }}>
          {/* the development team: one human, one helpful machine */}
          <rect x="0" y="62" width="120" height="28" fill="#44445c" />
          <circle cx="40" cy="34" r="12" fill="#e8c49a" />
          <rect x="30" y="46" width="20" height="22" rx="4" fill="#8f1a1a" />
          <rect x="68" y="26" width="26" height="22" rx="3" fill="#c8c8d8" />
          <rect x="72" y="31" width="6" height="6" fill="#2a5db0" />
          <rect x="84" y="31" width="6" height="6" fill="#2a5db0" />
          <rect x="74" y="42" width="14" height="2.5" fill="#444" />
          <rect x="71" y="48" width="20" height="18" rx="3" fill="#9a9ab0" />
          <text x="60" y="84" textAnchor="middle" fontSize="7" fill="#f1e9d2" fontFamily="Verdana">
            THE TEAM · est. 2026
          </text>
        </svg>
      ) : (
        <svg width="120" height="90" viewBox="0 0 120 90" style={{ border: '1px solid #7e7152', background: '#10243e' }}>
          {/* world and books */}
          <circle cx="60" cy="38" r="24" fill="#2a5db0" />
          <path d="M42 30 Q55 22 66 31 T80 40 Q70 52 56 48 T40 42 Z" fill="#4e7d4e" />
          <ellipse cx="60" cy="38" rx="24" ry="24" fill="none" stroke="#d4af37" strokeWidth="1.5" />
          <rect x="22" y="66" width="76" height="7" fill="#8f1a1a" />
          <rect x="28" y="73" width="64" height="7" fill="#3f7f7f" />
          <rect x="34" y="80" width="52" height="7" fill="#c9a227" />
        </svg>
      )}
    </div>
  )
}

export function AboutDialog({ onClose }: { onClose: () => void }) {
  return (
    <Dialog title="About Encartopedia" onClose={onClose} width={480}>
      <div style={{ display: 'flex', gap: 16 }}>
        <AboutPicture />
        <div style={{ fontFamily: 'var(--font-ui)' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 19, letterSpacing: '0.04em' }}>
            ENCARTOPEDIA &rsquo;95
          </div>
          <div style={{ marginTop: 2 }}>The Complete Interactive Multimedia Encyclopedia</div>
          <div style={{ marginTop: 10 }}>
            Version 95 (Build 2026)
            <br />
            Code name: Gandalf
          </div>
          <div style={{ marginTop: 10, color: 'var(--e-ink-soft)' }}>
            An unofficial fan homage. Not affiliated with Microsoft.
            <br />
            Article text from{' '}
            <a href="https://en.wikipedia.org" target="_blank" rel="noreferrer">
              Wikipedia
            </a>
            , available under{' '}
            <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">
              CC BY-SA 4.0
            </a>
            . Images are individually credited.
          </div>
          <CookiePreference />
          <div style={{ marginTop: 10, fontSize: 10, color: 'var(--e-ink-soft)' }}>
            This product is licensed to: Strange One From Another Time
          </div>
        </div>
      </div>
    </Dialog>
  )
}

/** Analytics cookie setting — changeable any time, honored immediately.
 *  (Re-enabling after a decline takes effect on the next page load.) */
function CookiePreference() {
  const [consent, setLocal] = useState<Consent | null>(getConsent)
  if (!GA_MEASUREMENT_ID) return null

  const change = (c: Consent) => {
    setConsent(c)
    setLocal(c)
  }

  return (
    <div style={{ marginTop: 10, fontSize: 11, borderTop: '1px solid var(--e-putty-dark)', paddingTop: 8 }}>
      Analytics cookies:{' '}
      <b>{consent === 'granted' ? 'Allowed' : consent === 'denied' ? 'Declined' : 'Not yet decided'}</b>{' '}
      <button
        className="e-btn"
        style={{ padding: '1px 8px', fontSize: 10, marginLeft: 6 }}
        onClick={() => change(consent === 'granted' ? 'denied' : 'granted')}
      >
        {consent === 'granted' ? 'Decline' : 'Allow'}
      </button>
    </div>
  )
}
