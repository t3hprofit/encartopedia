import { wikiFetch } from './client'

export interface CountryFact {
  qid: string
  name: string
  capital?: string
  population?: number
  iso2?: string
  isoNumeric?: string // joins to world-atlas TopoJSON feature ids
  flagUrl?: string
  articleTitle?: string
}

const CACHE_KEY = 'encartopedia.countries.v1'
const CACHE_MS = 30 * 24 * 3600 * 1000

const SPARQL = `
SELECT ?country ?countryLabel ?capitalLabel ?population ?iso2 ?ison ?flag ?article WHERE {
  ?country wdt:P31 wd:Q3624078 .
  FILTER NOT EXISTS { ?country wdt:P576 ?end }
  OPTIONAL { ?country wdt:P36 ?capital }
  OPTIONAL { ?country wdt:P1082 ?population }
  OPTIONAL { ?country wdt:P297 ?iso2 }
  OPTIONAL { ?country wdt:P299 ?ison }
  OPTIONAL { ?country wdt:P41 ?flag }
  OPTIONAL { ?article schema:about ?country ; schema:isPartOf <https://en.wikipedia.org/> }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}`

interface SparqlResponse {
  results: { bindings: Record<string, { value: string } | undefined>[] }
}

/** All current sovereign states with facts + flags — one query, cached locally
 *  for 30 days (Wikidata asks heavy queries to be cached; data is CC0). */
export async function getCountries(signal?: AbortSignal): Promise<CountryFact[]> {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null') as {
      at: number
      data: CountryFact[]
    } | null
    if (cached && Date.now() - cached.at < CACHE_MS) return cached.data
  } catch {
    /* re-fetch */
  }

  const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(SPARQL)}`
  const res = await wikiFetch<SparqlResponse>(url, { signal })
  const byQid = new Map<string, CountryFact>()
  for (const b of res.results.bindings) {
    const qid = b.country?.value.split('/').pop()
    if (!qid) continue
    const prev = byQid.get(qid)
    const fact: CountryFact = {
      qid,
      name: b.countryLabel?.value ?? qid,
      capital: prev?.capital ?? b.capitalLabel?.value,
      population: prev?.population ?? (b.population ? Number(b.population.value) : undefined),
      iso2: prev?.iso2 ?? b.iso2?.value,
      isoNumeric: prev?.isoNumeric ?? (b.ison ? b.ison.value.padStart(3, '0') : undefined),
      flagUrl: prev?.flagUrl ?? (b.flag ? `${b.flag.value}?width=320` : undefined),
      articleTitle: prev?.articleTitle ?? (b.article ? decodeURIComponent(b.article.value.split('/wiki/')[1] ?? '').replace(/_/g, ' ') : undefined),
    }
    byQid.set(qid, fact)
  }
  const data = [...byQid.values()].sort((a, b) => a.name.localeCompare(b.name))
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }))
  } catch {
    /* storage full — fine */
  }
  return data
}

export interface WorldTopology {
  type: 'Topology'
  objects: { countries: unknown; land?: unknown }
  // topojson-client takes it from here
  [k: string]: unknown
}

export async function getWorldTopology(signal?: AbortSignal): Promise<WorldTopology> {
  const res = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json', { signal })
  if (!res.ok) throw new Error(`world-atlas fetch failed: ${res.status}`)
  return (await res.json()) as WorldTopology
}
