import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TitleHit, spellSuggest } from '../../api/search'
import { PinpointerQuery, pinpointerSearch } from '../../api/pinpointer'
import { titleToPath } from '../../api/client'
import { AREAS } from '../../theme/areas'
import { playClick } from '../../sfx/audio'
import './pinpointer.css'

type Filter = 'word' | 'category' | 'media' | 'time' | 'place'

const ERAS: { label: string; from: number; to: number }[] = [
  { label: 'Antiquity', from: -3000, to: 476 },
  { label: 'Middle Ages', from: 477, to: 1453 },
  { label: 'Renaissance', from: 1454, to: 1700 },
  { label: 'Industrial', from: 1701, to: 1900 },
  { label: '20th Century', from: 1901, to: 2000 },
]

export function Pinpointer({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('word')
  const [areaId, setAreaId] = useState<string | undefined>()
  const [picturesOnly, setPicturesOnly] = useState(false)
  const [yearFrom, setYearFrom] = useState<string>('')
  const [yearTo, setYearTo] = useState<string>('')
  const [place, setPlace] = useState('')
  const [hits, setHits] = useState<TitleHit[]>([])
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [wizard, setWizard] = useState(false)
  const winRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ dx: number; dy: number } | null>(null)

  const activeQuery: PinpointerQuery = {
    q,
    areaId: filter === 'category' || areaId ? areaId : undefined,
    picturesOnly: picturesOnly || undefined,
    yearFrom: yearFrom !== '' ? Number(yearFrom) : undefined,
    yearTo: yearTo !== '' ? Number(yearTo) : undefined,
    place: filter === 'place' && place ? place : undefined,
  }
  const queryKey = JSON.stringify(activeQuery)

  useEffect(() => {
    const pq = JSON.parse(queryKey) as PinpointerQuery
    const isEmpty = !pq.q.trim() && !pq.areaId && !pq.place
    if (isEmpty) {
      setHits([])
      setSuggestion(null)
      return
    }
    const ctl = new AbortController()
    const t = setTimeout(async () => {
      setBusy(true)
      try {
        const pages = await pinpointerSearch(pq, ctl.signal)
        setHits(pages)
        if (pages.length < 3 && pq.q.trim()) {
          setSuggestion(await spellSuggest(pq.q, ctl.signal))
        } else {
          setSuggestion(null)
        }
      } catch {
        /* aborted or offline */
      } finally {
        setBusy(false)
      }
    }, 300)
    return () => {
      ctl.abort()
      clearTimeout(t)
    }
  }, [queryKey])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!drag.current || !winRef.current) return
      winRef.current.style.left = `${e.clientX - drag.current.dx}px`
      winRef.current.style.top = `${e.clientY - drag.current.dy}px`
      winRef.current.style.right = 'auto'
    }
    const onUp = () => (drag.current = null)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const open = (hit: TitleHit) => {
    playClick()
    navigate(`/w/article/${titleToPath(hit.key)}`)
  }

  const reset = () => {
    setQ('')
    setFilter('word')
    setAreaId(undefined)
    setPicturesOnly(false)
    setYearFrom('')
    setYearTo('')
    setPlace('')
    setWizard(false)
  }

  const filterActive: Record<Filter, boolean> = {
    word: !!q.trim(),
    category: !!areaId,
    media: picturesOnly,
    time: yearFrom !== '' || yearTo !== '',
    place: !!place.trim(),
  }

  const filters: { id: Filter; label: string }[] = [
    { id: 'word', label: 'Word' },
    { id: 'category', label: 'Category' },
    { id: 'media', label: 'Media' },
    { id: 'time', label: 'Time' },
    { id: 'place', label: 'Place' },
  ]

  return (
    <div className="e-pp" ref={winRef}>
      <div
        className="e-pp-title"
        onMouseDown={(e) => {
          const r = winRef.current!.getBoundingClientRect()
          drag.current = { dx: e.clientX - r.left, dy: e.clientY - r.top }
        }}
      >
        <span>▼ PINPOINTER</span>
        <button onClick={onClose}>Close</button>
      </div>
      <div className="e-pp-count">
        <span>{busy ? 'Searching…' : `${hits.length} Articles`}</span>
        <button className="e-btn" style={{ padding: '2px 8px', fontSize: 11 }} onClick={reset}>
          Reset
        </button>
      </div>
      {wizard && (
        <div className="e-pp-wizard">
          The Wizard suggests: type a <b>Word</b>, then narrow with <b>Category</b> (pick an Area of Interest),{' '}
          <b>Media</b> (only articles with pictures), <b>Time</b> (a year range — use minus for BC), or <b>Place</b>{' '}
          (articles near somewhere). Mix them freely.
        </div>
      )}
      <div className="e-pp-search">
        <input
          autoFocus
          placeholder={filter === 'place' ? 'Filter nearby articles…' : 'Type a word or phrase…'}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && hits[0] && open(hits[0])}
        />
      </div>
      {suggestion && suggestion.toLowerCase() !== q.toLowerCase() && (
        <div className="e-pp-suggest">
          Did you mean
          <button onClick={() => setQ(suggestion)}>{suggestion}</button>?
        </div>
      )}
      {filter === 'category' && (
        <div className="e-pp-panel">
          {AREAS.map((a) => (
            <label key={a.id}>
              <input
                type="radio"
                name="pp-area"
                checked={areaId === a.id}
                onChange={() => setAreaId(a.id)}
              />
              <span className="accent" style={{ background: a.accent }} /> {a.label}
            </label>
          ))}
          <label>
            <input type="radio" name="pp-area" checked={!areaId} onChange={() => setAreaId(undefined)} />
            All Areas
          </label>
        </div>
      )}
      {filter === 'media' && (
        <div className="e-pp-panel">
          <label>
            <input type="checkbox" checked={picturesOnly} onChange={(e) => setPicturesOnly(e.target.checked)} />
            Only articles with pictures
          </label>
          <div className="e-pp-note">Sounds &amp; animations arrive with the Media Gallery (Phase 3).</div>
        </div>
      )}
      {filter === 'time' && (
        <div className="e-pp-panel">
          <div className="e-pp-years">
            <label>
              From <input type="number" value={yearFrom} placeholder="-3000" onChange={(e) => setYearFrom(e.target.value)} />
            </label>
            <label>
              To <input type="number" value={yearTo} placeholder="1995" onChange={(e) => setYearTo(e.target.value)} />
            </label>
          </div>
          <div className="e-pp-eras">
            {ERAS.map((era) => (
              <button
                key={era.label}
                className="e-btn"
                onClick={() => {
                  setYearFrom(String(era.from))
                  setYearTo(String(era.to))
                }}
              >
                {era.label}
              </button>
            ))}
          </div>
          <div className="e-pp-note">Negative years are BC. Dated via Wikidata; undated articles are filtered out.</div>
        </div>
      )}
      {filter === 'place' && (
        <div className="e-pp-panel">
          <label style={{ display: 'block' }}>
            Near:{' '}
            <input
              type="text"
              value={place}
              placeholder="e.g. Kyoto"
              style={{ width: '70%' }}
              onChange={(e) => setPlace(e.target.value)}
            />
          </label>
          <div className="e-pp-note">Lists articles within 10 km of the place named above.</div>
        </div>
      )}
      <div className="e-pp-body">
        <div className="e-pp-list">
          {hits.length === 0 && !busy ? (
            <div className="e-pp-hint">
              {q.trim() || areaId || place
                ? 'No articles match. Loosen a filter, or check your spelling.'
                : 'The Pinpointer narrows the article list as you type. Use the buttons at right to filter.'}
            </div>
          ) : (
            hits.map((h) => (
              <button key={h.id} className="e-pp-item" onClick={() => open(h)} title={h.description}>
                {h.title}
                {h.description && <small>{h.description}</small>}
              </button>
            ))
          )}
        </div>
        <div className="e-pp-filters">
          {filters.map((f) => (
            <button
              key={f.id}
              className={`e-btn ${filter === f.id ? 'active' : ''} ${filterActive[f.id] ? 'lit' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
          <button className={`e-btn ${wizard ? 'active' : ''}`} style={{ marginTop: 8 }} onClick={() => setWizard((w) => !w)}>
            Wizard
          </button>
        </div>
      </div>
    </div>
  )
}
