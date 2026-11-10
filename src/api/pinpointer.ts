import { actionApiUrl, wikiFetch } from './client'
import { getSummary } from './page'
import { TitleHit, searchTitles } from './search'

/** Area of Interest → ORES articletopic values (validated live). */
export const AREA_TOPICS: Record<string, string> = {
  physical: 'physics|chemistry|space|technology|computing|mathematics|engineering',
  life: 'biology|medicine-and-health',
  geography: 'geographical',
  history: 'history|military-and-warfare',
  social: 'society|politics-and-government|business-and-economics|education',
  religion: 'philosophy-and-religion',
  art: 'visual-arts|literature|linguistics|architecture',
  performing: 'performing-arts|media',
  sports: 'sports',
}

export interface PinpointerQuery {
  q: string
  areaId?: string // Category filter
  picturesOnly?: boolean // Media filter
  yearFrom?: number // Time filter
  yearTo?: number
  place?: string // Place filter
}

interface SearchGenResponse {
  query?: {
    pages?: {
      pageid: number
      ns: number
      title: string
      index?: number
      description?: string
      thumbnail?: { source: string }
      pageprops?: { wikibase_item?: string }
    }[]
  }
}

async function cirrusSearch(
  srsearch: string,
  limit: number,
  signal?: AbortSignal,
  withProps = false,
): Promise<TitleHit[]> {
  const url = actionApiUrl({
    action: 'query',
    generator: 'search',
    gsrsearch: srsearch,
    gsrlimit: limit,
    gsrnamespace: 0,
    prop: withProps ? 'description|pageimages|pageprops' : 'description|pageimages',
    piprop: 'thumbnail',
    pithumbsize: 80,
    ppprop: 'wikibase_item',
  })
  const res = await wikiFetch<SearchGenResponse>(url, { signal })
  return (res.query?.pages ?? [])
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map((p) => ({
      id: p.pageid,
      key: p.title.replace(/ /g, '_'),
      title: p.title,
      description: p.description,
      thumbnail: p.thumbnail ? { url: p.thumbnail.source } : null,
      wikibase: p.pageprops?.wikibase_item,
    }))
}

interface EntitiesResponse {
  entities?: Record<string, { claims?: Record<string, { mainsnak?: { datavalue?: { value?: { time?: string } } } }[]> }>
}

/** Year of an entity via point-in-time (P585), birth (P569) or inception (P571). */
async function entityYears(ids: string[], signal?: AbortSignal): Promise<Map<string, number>> {
  const out = new Map<string, number>()
  if (ids.length === 0) return out
  const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${ids.slice(0, 50).join('|')}&props=claims&languages=en&format=json&origin=*`
  const res = await wikiFetch<EntitiesResponse>(url, { signal })
  for (const [id, ent] of Object.entries(res.entities ?? {})) {
    for (const prop of ['P585', 'P569', 'P571']) {
      const time = ent.claims?.[prop]?.[0]?.mainsnak?.datavalue?.value?.time
      if (time) {
        // Wikidata time format: +1889-03-31T00:00:00Z (or -0044-… for BC)
        const m = /^([+-])(\d{1,16})-/.exec(time)
        if (m) {
          out.set(id, Number(m[2]) * (m[1] === '-' ? -1 : 1))
          break
        }
      }
    }
  }
  return out
}

interface GeoSearchResponse {
  query?: { geosearch?: { pageid: number; title: string; dist: number }[] }
}

/** The Pinpointer's combined search. Word-only queries use the fast
 *  title word wheel; filters route through CirrusSearch and friends. */
export async function pinpointerSearch(pq: PinpointerQuery, signal?: AbortSignal): Promise<TitleHit[]> {
  const { q, areaId, picturesOnly, yearFrom, yearTo, place } = pq

  // Place: geosearch around the named location
  if (place?.trim()) {
    const anchor = await getSummary(place, signal)
    if (!anchor.coordinates) return []
    const { lat, lon } = anchor.coordinates
    const url = actionApiUrl({
      action: 'query',
      list: 'geosearch',
      gscoord: `${lat}|${lon}`,
      gsradius: 10000,
      gslimit: 40,
    })
    const res = await wikiFetch<GeoSearchResponse>(url, { signal })
    let hits: TitleHit[] = (res.query?.geosearch ?? []).map((g) => ({
      id: g.pageid,
      key: g.title.replace(/ /g, '_'),
      title: g.title,
      description: `${(g.dist / 1000).toFixed(1)} km from ${anchor.title}`,
    }))
    if (q.trim()) {
      const needle = q.trim().toLowerCase()
      hits = hits.filter((h) => h.title.toLowerCase().includes(needle))
    }
    return hits
  }

  const hasTime = yearFrom !== undefined || yearTo !== undefined

  // plain word search → word wheel
  if (!areaId && !picturesOnly && !hasTime) {
    return searchTitles(q, 30, signal)
  }

  if (!q.trim() && !areaId) return []

  let srsearch = q.trim() || 'the'
  if (areaId && AREA_TOPICS[areaId]) srsearch += ` articletopic:${AREA_TOPICS[areaId]}`

  let hits = await cirrusSearch(srsearch, hasTime ? 40 : 30, signal, hasTime)

  if (picturesOnly) hits = hits.filter((h) => h.thumbnail)

  if (hasTime) {
    const ids = hits.map((h) => h.wikibase).filter((x): x is string => !!x)
    const years = await entityYears(ids, signal)
    const from = yearFrom ?? -Infinity
    const to = yearTo ?? Infinity
    hits = hits.filter((h) => {
      const y = h.wikibase ? years.get(h.wikibase) : undefined
      return y !== undefined && y >= from && y <= to
    })
    hits = hits.map((h) => ({
      ...h,
      description: h.wikibase && years.has(h.wikibase) ? `${formatYear(years.get(h.wikibase)!)} — ${h.description ?? ''}` : h.description,
    }))
  }

  return hits
}

export const formatYear = (y: number) => (y < 0 ? `${-y} BC` : `AD ${y}`)
