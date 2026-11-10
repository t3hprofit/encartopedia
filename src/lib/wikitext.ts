// Pure helpers for massaging Parsoid output — kept DOM-free where possible
// so they can be unit-tested in node.

/** Sections Encarta wouldn't have shown; we offer Related Articles instead. */
const STRIP_SECTIONS = new Set([
  'references',
  'external links',
  'bibliography',
  'notes',
  'citations',
  'sources',
  'further reading',
  'see also',
  'works cited',
  'footnotes',
])

export const shouldStripSection = (heading: string): boolean =>
  STRIP_SECTIONS.has(heading.trim().toLowerCase())

/** Parsoid wiki-link hrefs are relative: "./Eiffel_Tower#History". */
export function wikiHrefToRoute(href: string): string | null {
  const m = /^\.\/([^#?]+)(#.*)?$/.exec(href)
  if (!m) return null
  const title = m[1]
  // namespaced pages (File:, Category:, Help:…) aren't articles
  if (/^(File|Category|Help|Wikipedia|Template|Special|Portal|Talk|Draft)(_talk)?:/i.test(decodeURIComponent(title)))
    return null
  return `#/w/article/${title}`
}

export interface OutlineEntry {
  id: string
  heading: string
}
