import { EN_WIKI, actionApiUrl, titleToPath, wikiFetch } from './client'
import { shouldStripSection, wikiHrefToRoute, OutlineEntry } from '../lib/wikitext'

export interface PageSummary {
  title: string
  displaytitle?: string
  description?: string
  extract: string
  extract_html?: string
  thumbnail?: { source: string; width: number; height: number }
  originalimage?: { source: string }
  coordinates?: { lat: number; lon: number }
  wikibase_item?: string
  content_urls?: { desktop?: { page?: string } }
  type?: string
}

export async function getSummary(title: string, signal?: AbortSignal): Promise<PageSummary> {
  return wikiFetch<PageSummary>(`${EN_WIKI}/api/rest_v1/page/summary/${titleToPath(title)}`, { signal })
}

export interface ArticleDoc {
  title: string
  outline: OutlineEntry[]
  /** processed HTML of the whole article (lead + kept sections) */
  html: string
  sourceUrl: string
}

/** Fetch Parsoid HTML and press it into Encarta shape:
 *  strip chrome-ish sections, rewrite wiki links to app routes,
 *  open externals in new tabs, drop TemplateStyles. */
export async function getArticle(title: string, signal?: AbortSignal): Promise<ArticleDoc> {
  const path = titleToPath(title)
  const res = await fetch(`${EN_WIKI}/api/rest_v1/page/html/${path}`, {
    signal,
    headers: { 'Api-User-Agent': 'Encartopedia95/1.0 (woodardj85@gmail.com)' },
  })
  if (!res.ok) throw new Error(`Article fetch failed: HTTP ${res.status}`)
  const raw = await res.text()

  const doc = new DOMParser().parseFromString(raw, 'text/html')
  const body = doc.body

  // drop style/link noise so the retro stylesheet rules alone
  body.querySelectorAll('style, link').forEach((el) => el.remove())
  // reference markers ([1], [2]) — Encarta articles had no footnotes
  body.querySelectorAll('sup[typeof~="mw:Extension/ref"], sup.mw-ref').forEach((el) => el.remove())
  // edit-section leftovers and hidden tracking categories
  body.querySelectorAll('.mw-editsection, .mw-empty-elt, [style*="display:none"]').forEach((el) => el.remove())
  // hatnotes and ambox maintenance banners
  body.querySelectorAll('.hatnote, .ambox, .navbox, .sistersitebox, .metadata').forEach((el) => el.remove())

  const outline: OutlineEntry[] = [{ id: 'e-lead', heading: 'Introduction' }]
  const sections = Array.from(body.querySelectorAll(':scope > section'))
  for (const sec of sections) {
    const h = sec.querySelector(':scope > h2')
    if (!h) {
      if (sec.getAttribute('data-mw-section-id') === '0') sec.id = 'e-lead'
      continue
    }
    const heading = h.textContent ?? ''
    if (shouldStripSection(heading)) {
      sec.remove()
      continue
    }
    const id = `e-sec-${outline.length}`
    sec.id = id
    outline.push({ id, heading })
  }

  // links: wiki links → app routes, others → new tab
  body.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href') ?? ''
    const route = wikiHrefToRoute(href)
    if (route) {
      a.setAttribute('href', route)
    } else if (/^(https?:)?\/\//.test(href)) {
      a.setAttribute('target', '_blank')
      a.setAttribute('rel', 'noreferrer')
    } else {
      // relative non-article link (File:, anchors into stripped refs, …)
      a.removeAttribute('href')
    }
  })

  body.querySelectorAll('img').forEach((img) => img.setAttribute('loading', 'lazy'))

  return {
    title,
    outline,
    html: body.innerHTML,
    sourceUrl: `${EN_WIKI}/wiki/${path}`,
  }
}

interface SearchListResponse {
  query?: { search?: { title: string; snippet?: string }[] }
}

/** Related Articles via CirrusSearch morelike. */
export async function getRelated(title: string, signal?: AbortSignal): Promise<string[]> {
  const url = actionApiUrl({
    action: 'query',
    list: 'search',
    srsearch: `morelike:${title}`,
    srlimit: 12,
  })
  const res = await wikiFetch<SearchListResponse>(url, { signal })
  return (res.query?.search ?? []).map((s) => s.title)
}

interface CategoriesResponse {
  query?: { pages?: { categories?: { title: string }[] }[] }
}

export async function getCategories(title: string, signal?: AbortSignal): Promise<string[]> {
  const url = actionApiUrl({
    action: 'query',
    titles: title,
    prop: 'categories',
    clshow: '!hidden',
    cllimit: 30,
  })
  const res = await wikiFetch<CategoriesResponse>(url, { signal })
  return (res.query?.pages?.[0]?.categories ?? []).map((c) => c.title.replace(/^Category:/, ''))
}
