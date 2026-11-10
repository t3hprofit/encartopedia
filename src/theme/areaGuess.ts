import { AREAS, Area } from './areas'

// keyword → area heuristics applied to an article's visible category names
const KEYWORDS: [string, RegExp][] = [
  ['life', /\b(species|animal|plant|biolog|medic|health|anatomy|disease|birds?|mammal|fish|insect|flora|fauna|genetic)/i],
  ['physical', /\b(physic|chemi|astro|space|technolog|comput|engineer|invent|mathemat|electronic|machine|energy)/i],
  ['geography', /\b(countr|cit(y|ies)|river|lake|mountain|island|ocean|sea|geograph|capital|territor|continent|region)/i],
  ['history', /\b(histor|war|battle|empire|dynast|ancient|medieval|revolution|century|monarch|king|queen|president)/i],
  ['religion', /\b(religio|philosoph|myth|deit|god|church|buddhis|islam|hindu|jewish|christia|sacred|theolog)/i],
  ['performing', /\b(music|opera|film|television|theatre|theater|dance|ballet|composer|singer|band|album|actor)/i],
  ['art', /\b(paint|sculpt|architect|literat|novel|poet|writer|language|lingui|photograph|art)/i],
  ['sports', /\b(sport|olympi|football|baseball|basketball|tennis|golf|hockey|game|hobby|pets?)\b/i],
  ['social', /\b(sociolog|anthropolog|archaeolog|econom|politic|psycholog|law|legal|education|holiday|festival)/i],
]

/** Best-effort mapping of an article to an Area of Interest for the
 *  watermark + accent. Defaults to History's classical column. */
export function guessArea(categories: string[]): Area {
  const text = categories.join(' | ')
  for (const [id, re] of KEYWORDS) {
    if (re.test(text)) return AREAS.find((a) => a.id === id)!
  }
  return AREAS.find((a) => a.id === 'history')!
}
