import { useEffect, useState } from 'react'
import { getFeatured, FeaturedDay } from '../../api/feeds'
import { getMediaList, MediaItem } from '../../api/media'
import { MediaDialog } from '../media/MediaDialog'
import { readBackList } from '../../lib/backlist'
import './gallery.css'

type Tab = 'potd' | 'article'

/** The Media Gallery: all non-text media, browsable in one place. The disc
 *  held 8,000 pictures; our disc refreshes daily. */
export function GalleryView() {
  const [tab, setTab] = useState<Tab>('potd')
  const [days, setDays] = useState<FeaturedDay[]>([])
  const [articleQ, setArticleQ] = useState('')
  const [loadedFor, setLoadedFor] = useState('')
  const [items, setItems] = useState<MediaItem[]>([])
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState<{ file: string; caption?: string } | null>(null)

  useEffect(() => {
    const ctl = new AbortController()
    const today = new Date()
    const dates = Array.from({ length: 12 }, (_, i) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - i))
    Promise.allSettled(dates.map((d) => getFeatured(d, ctl.signal))).then((results) => {
      setDays(results.filter((r): r is PromiseFulfilledResult<FeaturedDay> => r.status === 'fulfilled').map((r) => r.value))
    })
    return () => ctl.abort()
  }, [])

  const loadArticle = async (title: string) => {
    if (!title.trim()) return
    setBusy(true)
    setTab('article')
    setLoadedFor(title)
    try {
      setItems((await getMediaList(title)).filter((i) => i.showInGallery !== false))
    } catch {
      setItems([])
    } finally {
      setBusy(false)
    }
  }

  const visited = readBackList().slice(0, 8)

  return (
    <>
      <div className="e-banner">
        Media Gallery <small>{tab === 'potd' ? 'PICTURES OF THE DAY' : loadedFor.toUpperCase()}</small>
      </div>
      <div className="e-gallery-tabs">
        <button className={`e-btn ${tab === 'potd' ? 'active' : ''}`} onClick={() => setTab('potd')}>
          Pictures of the Day
        </button>
        <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
          <input
            className="e-gallery-input"
            placeholder="Media from an article…"
            value={articleQ}
            onChange={(e) => setArticleQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadArticle(articleQ)}
          />
          <button className="e-btn" onClick={() => loadArticle(articleQ)}>
            Show
          </button>
        </span>
        {visited.map((v) => (
          <button key={v.title} className="e-btn e-gallery-chip" onClick={() => loadArticle(v.title)}>
            {v.title}
          </button>
        ))}
      </div>
      <div className="e-page-scroll">
        <div className="e-gallery-grid">
          {tab === 'potd' &&
            days.map(
              (d) =>
                d.image && (
                  <button
                    key={d.date.toISOString()}
                    className="e-gallery-card"
                    onClick={() => setOpen({ file: d.image!.title, caption: d.image!.description?.text })}
                  >
                    <img src={d.image.thumbnail?.source ?? d.image.image?.source} alt="" loading="lazy" />
                    <span>{d.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </button>
                ),
            )}
          {tab === 'article' &&
            items.map((m) => (
              <button
                key={m.title}
                className="e-gallery-card"
                onClick={() => setOpen({ file: m.title, caption: m.caption?.text })}
              >
                {m.type === 'image' && m.srcset?.[0] ? (
                  <img src={m.srcset[0].src} alt="" loading="lazy" />
                ) : (
                  <span className="e-gallery-badge">{m.type === 'audio' ? '◖)) Audio' : '▶ Video'}</span>
                )}
                <span>{m.caption?.text?.slice(0, 60) || m.title.replace(/^File:/, '').replace(/_/g, ' ').slice(0, 60)}</span>
              </button>
            ))}
        </div>
        {tab === 'article' && busy && <div className="e-article-status">Spinning up the disc…</div>}
        {tab === 'article' && !busy && items.length === 0 && loadedFor && (
          <div className="e-article-status">No gallery media on that article.</div>
        )}
      </div>
      {open && <MediaDialog fileTitle={open.file} caption={open.caption} onClose={() => setOpen(null)} />}
    </>
  )
}
