import { actionApiUrl, wikiFetch } from './client'

export interface BrowseItem {
  title: string
  description?: string
  thumbnail?: { source: string }
}

interface GeneratorResponse {
  continue?: { gcmcontinue?: string }
  query?: {
    pages?: {
      title: string
      ns: number
      description?: string
      thumbnail?: { source: string }
    }[]
  }
}

export interface BrowsePage {
  items: BrowseItem[]
  cont?: string
}

/** List articles in a Wikipedia category with descriptions + thumbnails. */
export async function browseCategory(category: string, cont?: string, signal?: AbortSignal): Promise<BrowsePage> {
  const url = actionApiUrl({
    action: 'query',
    generator: 'categorymembers',
    gcmtitle: `Category:${category}`,
    gcmtype: 'page',
    gcmlimit: 40,
    ...(cont ? { gcmcontinue: cont } : {}),
    prop: 'description|pageimages',
    piprop: 'thumbnail',
    pithumbsize: 120,
  })
  const res = await wikiFetch<GeneratorResponse>(url, { signal })
  const items = (res.query?.pages ?? [])
    .filter((p) => p.ns === 0)
    .map((p) => ({ title: p.title, description: p.description, thumbnail: p.thumbnail }))
    .sort((a, b) => a.title.localeCompare(b.title))
  return { items, cont: res.continue?.gcmcontinue }
}

interface RandomSummary {
  title?: string
  titles?: { canonical: string }
}

export async function randomArticleTitle(): Promise<string> {
  const res = await wikiFetch<RandomSummary>('https://en.wikipedia.org/api/rest_v1/page/random/summary')
  return res.titles?.canonical ?? res.title ?? 'Encyclopedia'
}
