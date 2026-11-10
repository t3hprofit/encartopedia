import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { areaById } from '../../theme/areas'
import { Watermark } from '../../theme/Watermark'
import { browseCategory, BrowseItem } from '../../api/browse'
import { titleToPath } from '../../api/client'
import './browse.css'

export function BrowseView() {
  const { areaId, subIdx } = useParams()
  const area = areaById(areaId)
  const subIndex = subIdx !== undefined ? Number(subIdx) : 0
  const sub = area?.subcategories[subIndex]

  const [items, setItems] = useState<BrowseItem[]>([])
  const [cont, setCont] = useState<string | undefined>()
  const [busy, setBusy] = useState(false)
  const [catIdx, setCatIdx] = useState(0) // which wikiCategory within the subcategory

  const wikiCat = sub?.wikiCategories[catIdx]

  useEffect(() => {
    setItems([])
    setCont(undefined)
    setCatIdx(0)
  }, [areaId, subIdx])

  useEffect(() => {
    if (!wikiCat) return
    const ctl = new AbortController()
    setBusy(true)
    browseCategory(wikiCat, undefined, ctl.signal)
      .then((p) => {
        setItems(p.items)
        setCont(p.cont)
      })
      .catch(() => {})
      .finally(() => setBusy(false))
    return () => ctl.abort()
  }, [wikiCat])

  const more = async () => {
    if (!wikiCat || !cont) return
    setBusy(true)
    try {
      const p = await browseCategory(wikiCat, cont)
      setItems((prev) => [...prev, ...p.items])
      setCont(p.cont)
    } finally {
      setBusy(false)
    }
  }

  if (!area || !sub) {
    return (
      <>
        <div className="e-banner">Browse</div>
        <div className="e-page-scroll">
          <div className="e-welcome">
            <p>Pick an Area of Interest from the toolbar to begin browsing.</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="e-banner" style={{ borderBottom: `3px solid ${area.accent}` }}>
        {area.label} <small>{sub.label.toUpperCase()}</small>
      </div>
      <div className="e-page-scroll">
        <Watermark kind={area.watermark} />
        <div className="e-browse">
          {sub.wikiCategories.length > 1 && (
            <div className="e-browse-cats">
              {sub.wikiCategories.map((c, i) => (
                <button key={c} className={`e-btn ${i === catIdx ? 'active' : ''}`} onClick={() => setCatIdx(i)}>
                  {c.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          )}
          <div className="e-browse-list">
            {items.map((it) => (
              <Link key={it.title} className="e-browse-item" to={`/w/article/${titleToPath(it.title)}`}>
                {it.thumbnail ? (
                  <img src={it.thumbnail.source} alt="" loading="lazy" />
                ) : (
                  <span className="e-browse-noimg" style={{ background: area.accent }} />
                )}
                <span>
                  {it.title}
                  {it.description && <small>{it.description}</small>}
                </span>
              </Link>
            ))}
          </div>
          {busy && <div className="e-article-status">Consulting the index…</div>}
          {!busy && items.length === 0 && (
            <div className="e-article-status">This drawer of the card catalog is empty.</div>
          )}
          {cont && !busy && (
            <button className="e-btn" style={{ margin: '10px 0 24px' }} onClick={more}>
              More Articles…
            </button>
          )}
        </div>
      </div>
    </>
  )
}
