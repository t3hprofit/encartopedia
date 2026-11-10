import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchTitles, spellSuggest, TitleHit } from '../../api/search'
import { titleToPath } from '../../api/client'
import { playClick } from '../../sfx/audio'
import './pinpointer.css'

type Filter = 'word' | 'category' | 'media' | 'time' | 'place'

export function Pinpointer({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<TitleHit[]>([])
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('word')
  const [busy, setBusy] = useState(false)
  const winRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ dx: number; dy: number } | null>(null)

  // word-wheel: debounced title search with abort
  useEffect(() => {
    if (!q.trim()) {
      setHits([])
      setSuggestion(null)
      return
    }
    const ctl = new AbortController()
    const t = setTimeout(async () => {
      setBusy(true)
      try {
        const pages = await searchTitles(q, 30, ctl.signal)
        setHits(pages)
        // '95-style spell help when the wheel comes up short
        if (pages.length < 3) {
          setSuggestion(await spellSuggest(q, ctl.signal))
        } else {
          setSuggestion(null)
        }
      } catch {
        /* aborted or offline — keep previous list */
      } finally {
        setBusy(false)
      }
    }, 250)
    return () => {
      ctl.abort()
      clearTimeout(t)
    }
  }, [q])

  // draggable window
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
        <button
          className="e-btn"
          style={{ padding: '2px 8px', fontSize: 11 }}
          onClick={() => {
            setQ('')
            setFilter('word')
          }}
        >
          Reset
        </button>
      </div>
      <div className="e-pp-search">
        <input
          autoFocus
          placeholder="Type a word or phrase…"
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
      <div className="e-pp-body">
        <div className="e-pp-list">
          {hits.length === 0 && !busy ? (
            <div className="e-pp-hint">
              {q.trim()
                ? 'No articles match. Check your spelling, or try fewer words.'
                : 'The Pinpointer narrows the article list as you type.'}
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
              className={`e-btn ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
              title={f.id === 'word' ? 'Search by word or phrase' : 'Coming in Phase 2'}
            >
              {f.label}
            </button>
          ))}
          <button className="e-btn" title="The Wizard walks you through a search" style={{ marginTop: 8 }}>
            Wizard
          </button>
        </div>
      </div>
    </div>
  )
}
