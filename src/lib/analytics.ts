// Google Analytics 4, loaded lazily and politely:
// - no-op unless a measurement ID is configured
// - respects Do Not Track / Global Privacy Control
// - manual page_view events (hash routing invisible to gtag's auto pageview)

import { GA_MEASUREMENT_ID } from '../config'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

let initialized = false

function privacyOptOut(): boolean {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean }
  return navigator.doNotTrack === '1' || nav.globalPrivacyControl === true
}

export function initAnalytics(): void {
  if (initialized || !GA_MEASUREMENT_ID || privacyOptOut()) return
  initialized = true

  window.dataLayer = window.dataLayer ?? []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args)
  }
  window.gtag('js', new Date())
  // send_page_view off: the router reports every view, including the first
  window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false })

  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(s)
}

/** Report a SPA page view. `path` is the route (e.g. /w/article/Castle). */
export function trackPageView(path: string): void {
  if (!initialized || !window.gtag) return
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: `${location.origin}${location.pathname}#${path}`,
    page_title: document.title,
  })
}

/** Report a named app event with optional params. */
export function trackEvent(name: string, params?: Record<string, string | number | boolean>): void {
  if (!initialized || !window.gtag) return
  window.gtag('event', name, params)
}
