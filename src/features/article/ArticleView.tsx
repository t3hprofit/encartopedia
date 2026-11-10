import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getArticle, getCategories, getRelated, ArticleDoc } from '../../api/page'
import { pathToTitle, titleToPath } from '../../api/client'
import { PullDown } from '../../ui/PullDown'
import { Watermark } from '../../theme/Watermark'
import { guessArea } from '../../theme/areaGuess'
import { AREAS, Area } from '../../theme/areas'
import { recordVisit } from '../../lib/backlist'
import './article.css'

type Pane = 'outline' | 'related'
const SIZES = { Small: '13px', Medium: '15px', Large: '18px' } as const
type SizeName = keyof typeof SIZES

export function ArticleView() {
  const { title: rawTitle = '' } = useParams()
  const title = pathToTitle(rawTitle)
  const navigate = useNavigate()

  const [doc, setDoc] = useState<ArticleDoc | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [area, setArea] = useState<Area>(AREAS[3])
  const [related, setRelated] = useState<string[]>([])
  const [pane, setPane] = useState<Pane>('outline')
  const [size, setSize] = useState<SizeName>('Medium')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctl = new AbortController()
    setDoc(null)
    setError(null)
    setPane('outline')
    getArticle(title, ctl.signal)
      .then((d) => {
        setDoc(d)
        recordVisit(title)
        scrollRef.current?.scrollTo(0, 0)
      })
      .catch((e) => {
        if (!ctl.signal.aborted) setError(e instanceof Error ? e.message : String(e))
      })
    getCategories(title, ctl.signal)
      .then((cats) => setArea(guessArea(cats)))
      .catch(() => {})
    getRelated(title, ctl.signal)
      .then(setRelated)
      .catch(() => {})
    return () => ctl.abort()
  }, [title])

  // internal link clicks already carry #/w/article/... hrefs; let the router take them
  const onBodyClick = (e: React.MouseEvent) => {
    const a = (e.target as HTMLElement).closest('a')
    if (a?.getAttribute('href')?.startsWith('#/w/article/')) {
      e.preventDefault()
      navigate(a.getAttribute('href')!.slice(1))
    }
  }

  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const isGates = title === 'Bill Gates'

  return (
    <>
      <div className="e-banner" style={{ borderBottom: `3px solid ${area.accent}` }}>
        {title}
        {isGates && (
          <span className="e-editors-choice" title="This biography received uncommonly generous coverage in a certain 1995 encyclopedia.">
            EDITOR&rsquo;S CHOICE
          </span>
        )}
        <small>{area.label.toUpperCase()}</small>
      </div>
      <div className="e-article-layout">
        <div className="e-outline">
          <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--e-putty-dark)' }}>
            <PullDown label={`Text: ${size}`} kind="select" buttonClass="" menuClass="">
              {(close) => (
                <>
                  {(Object.keys(SIZES) as SizeName[]).map((s) => (
                    <button
                      key={s}
                      className="e-menu-item"
                      onClick={() => {
                        setSize(s)
                        close()
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </>
              )}
            </PullDown>
          </div>
          <div className="e-outline-list">
            {pane === 'outline'
              ? doc?.outline.map((o) => (
                  <button key={o.id} onClick={() => jump(o.id)}>
                    {o.heading}
                  </button>
                ))
              : related.map((r) => (
                  <Link key={r} to={`/w/article/${titleToPath(r)}`} style={{ display: 'block', padding: '4px 12px', fontSize: 12 }}>
                    {r}
                  </Link>
                ))}
            {pane === 'related' && related.length === 0 && (
              <div style={{ padding: 12, fontSize: 11, color: 'var(--e-ink-soft)' }}>Searching the stacks…</div>
            )}
          </div>
          <div className="e-outline-tabs">
            <button className={pane === 'outline' ? 'active' : ''} onClick={() => setPane('outline')}>
              Outline
            </button>
            <button className={pane === 'related' ? 'active' : ''} onClick={() => setPane('related')}>
              Related Articles
            </button>
          </div>
        </div>
        <div className="e-article-scroll" ref={scrollRef}>
          <Watermark kind={area.watermark} />
          {error ? (
            <div className="e-article-status">
              <p>The requested article could not be read from the disc.</p>
              <p style={{ fontSize: 11 }}>{error}</p>
              <p>
                Try the <b>Find</b> button — the Pinpointer forgives spelling.
              </p>
            </div>
          ) : !doc ? (
            <div className="e-article-status">Reading from CD-ROM… (please do not open the drive tray)</div>
          ) : (
            <>
              <div
                className="e-article"
                style={{ ['--e-article-size' as string]: SIZES[size] }}
                onClick={onBodyClick}
                dangerouslySetInnerHTML={{ __html: doc.html }}
              />
              <div className="e-article-footer">
                Text from{' '}
                <a href={doc.sourceUrl} target="_blank" rel="noreferrer">
                  Wikipedia — {title}
                </a>
                , available under{' '}
                <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">
                  CC BY-SA 4.0
                </a>
                . Images are credited via their Caption dialogs.
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
