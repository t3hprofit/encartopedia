import { EN_WIKI, actionApiUrl, wikiFetch } from './client'

export interface TitleHit {
  id: number
  key: string
  title: string
  description?: string
  thumbnail?: { url: string } | null
  /** wikibase item id, present when the query needed Wikidata (Time filter) */
  wikibase?: string
}

interface TitleSearchResponse {
  pages: TitleHit[]
}

/** Word-wheel search: one call returns titles + descriptions + thumbnails. */
export async function searchTitles(q: string, limit = 25, signal?: AbortSignal): Promise<TitleHit[]> {
  if (!q.trim()) return []
  const url = `${EN_WIKI}/w/rest.php/v1/search/title?q=${encodeURIComponent(q)}&limit=${limit}`
  const res = await wikiFetch<TitleSearchResponse>(url, { signal })
  return res.pages
}

export async function searchFullText(q: string, limit = 25, signal?: AbortSignal): Promise<TitleHit[]> {
  if (!q.trim()) return []
  const url = `${EN_WIKI}/w/rest.php/v1/search/page?q=${encodeURIComponent(q)}&limit=${limit}`
  const res = await wikiFetch<TitleSearchResponse>(url, { signal })
  return res.pages
}

interface SuggestResponse {
  query?: { searchinfo?: { suggestion?: string }; search: { title: string }[] }
}

/** Spell-check suggestion — the '95-only Pinpointer nicety ("Kat" → cat). */
export async function spellSuggest(q: string, signal?: AbortSignal): Promise<string | null> {
  const url = actionApiUrl({ action: 'query', list: 'search', srsearch: q, srlimit: 1, srinfo: 'suggestion' })
  const res = await wikiFetch<SuggestResponse>(url, { signal })
  return res.query?.searchinfo?.suggestion ?? null
}
