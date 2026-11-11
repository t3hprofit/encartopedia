import { useState } from 'react'
import { consentPending, setConsent } from '../../lib/analytics'
import './consent.css'

/** One-time analytics consent bar. GA does not load until Accept. */
export function CookieBanner() {
  const [visible, setVisible] = useState(consentPending)
  if (!visible) return null

  const answer = (granted: boolean) => {
    setConsent(granted ? 'granted' : 'denied')
    setVisible(false)
  }

  return (
    <div className="e-cookiebar" role="dialog" aria-label="Cookie preferences">
      <span className="e-cookiebar-text">
        <b>This encyclopedia would like to use cookies.</b> In 1995 that meant something else entirely. One
        optional Google Analytics cookie counts visitors — no ads, no sale of data, and nothing is set unless
        you accept. Changeable later in the <i>About</i> box (the blue &ldquo;i&rdquo;).
      </span>
      <span className="e-cookiebar-actions">
        <button className="e-btn" onClick={() => answer(true)}>
          Accept
        </button>
        <button className="e-btn" onClick={() => answer(false)}>
          Decline
        </button>
      </span>
    </div>
  )
}
