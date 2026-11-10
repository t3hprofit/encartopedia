import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ERAS, formatTimelineYear, TimelineItem } from '../../data/timelineEras'
import { getOnThisDay, OnThisDayEvent } from '../../api/feeds'
import { getSummary, PageSummary } from '../../api/page'
import { titleToPath } from '../../api/client'
import { playClick } from '../../sfx/audio'
import './timeline.css'

/** Simple line-art bookends: the mammoth opens the band, the Shuttle closes it. */
const Mammoth = () => (
  <svg viewBox="0 0 100 80" className="e-tl-bookend">
    <path d="M18 62 v-14 M30 62 v-16 M58 62 v-15 M70 62 v-13 M14 48 q-2 -18 14 -24 q16 -7 30 2 q10 7 12 18 q1 8 -2 12 M14 48 q-6 2 -8 8 M68 36 q10 -2 14 4 q4 7 -2 12 q-6 4 -8 -2 M28 26 q2 -8 10 -9" />
    <path d="M12 56 q-8 4 -6 14 q6 -2 8 -8" />
  </svg>
)

const Shuttle = () => (
  <svg viewBox="0 0 100 80" className="e-tl-bookend">
    <path d="M30 64 L38 20 q2 -10 6 -14 q4 4 6 14 L58 64 Z M38 64 v8 M50 64 v8 M30 64 h28" />
    <path d="M30 50 L14 62 L30 58 M58 50 L74 62 L58 58" />
    <path d="M36 72 q2 6 8 6 q6 0 8 -6" />
  </svg>
)

export function TimelineView() {
  const navigate = useNavigate()
  const [card, setCard] = useState<{ item: TimelineItem; summary?: PageSummary } | null>(null)
  const [today, setToday] = useState<OnThisDayEvent[]>([])
  const now = new Date()

  useEffect(() => {
    const ctl = new AbortController()
    getOnThisDay('events', now.getMonth() + 1, now.getDate(), ctl.signal)
      .then((ev) => setToday(ev.slice(0, 14)))
      .catch(() => {})
    return () => ctl.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openCard = async (item: TimelineItem) => {
    playClick()
    setCard({ item })
    try {
      setCard({ item, summary: await getSummary(item.article) })
    } catch {
      /* card still works without the summary */
    }
  }

  return (
    <>
      <div className="e-banner">
        Timeline <small>15,000,000 BC — THE PRESENT</small>
      </div>
      <div className="e-tl-today">
        <span className="e-tl-today-label">
          ON THIS DAY · {now.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
        </span>
        <div className="e-tl-today-strip">
          {today.map((e, i) => (
            <button
              key={i}
              onClick={() =>
                e.pages[0] && navigate(`/w/article/${titleToPath(e.pages[0].titles?.normalized ?? e.pages[0].title)}`)
              }
              title={e.text}
            >
              <b>{e.year}</b> {e.text.length > 70 ? `${e.text.slice(0, 70)}…` : e.text}
            </button>
          ))}
        </div>
      </div>
      <div className="e-tl-band">
        <div className="e-tl-scroll">
          <div className="e-tl-end">
            <Mammoth />
            <span>15,000,000 BC</span>
          </div>
          {ERAS.map((era) => (
            <section key={era.id} className="e-tl-era" style={{ borderTopColor: era.color }}>
              <header>
                <span className="e-tl-era-name" style={{ color: era.color }}>
                  {era.label}
                </span>
                <span className="e-tl-era-span">{era.span}</span>
              </header>
              <div className="e-tl-items">
                {era.items.map((item) => (
                  <button key={`${item.year}-${item.article}`} className="e-tl-item" onClick={() => openCard(item)}>
                    <span className="e-tl-year" style={{ background: era.color }}>
                      {formatTimelineYear(item.year)}
                    </span>
                    <span className="e-tl-label">{item.label}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
          <div className="e-tl-end">
            <Shuttle />
            <span>…and counting</span>
            <small className="e-tl-seam">the disc was pressed in 1994; the internet kept going</small>
          </div>
        </div>
      </div>
      {card && (
        <div className="e-tl-card-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setCard(null)}>
          <div className="e-tl-card">
            <div className="e-tl-card-title">
              <span>{formatTimelineYear(card.item.year)} — {card.item.label}</span>
              <button onClick={() => setCard(null)}>✕</button>
            </div>
            <div className="e-tl-card-body">
              {card.summary?.thumbnail && <img src={card.summary.thumbnail.source} alt="" />}
              <p>{card.summary?.extract ?? 'Consulting the encyclopedia…'}</p>
            </div>
            <button
              className="e-btn"
              style={{ margin: '0 12px 12px' }}
              onClick={() => navigate(`/w/article/${titleToPath(card.item.article)}`)}
            >
              Go to Article ▶
            </button>
          </div>
        </div>
      )}
    </>
  )
}
