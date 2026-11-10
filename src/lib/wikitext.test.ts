import { describe, expect, it } from 'vitest'
import { shouldStripSection, wikiHrefToRoute } from './wikitext'

describe('wikiHrefToRoute', () => {
  it('rewrites Parsoid relative links to app routes', () => {
    expect(wikiHrefToRoute('./Eiffel_Tower')).toBe('#/w/article/Eiffel_Tower')
  })
  it('drops fragments onto the article route', () => {
    expect(wikiHrefToRoute('./Eiffel_Tower#History')).toBe('#/w/article/Eiffel_Tower')
  })
  it('rejects namespaced pages', () => {
    expect(wikiHrefToRoute('./File:Eiffel.jpg')).toBeNull()
    expect(wikiHrefToRoute('./Category:Towers')).toBeNull()
    expect(wikiHrefToRoute('./Help:Contents')).toBeNull()
  })
  it('rejects absolute and external urls', () => {
    expect(wikiHrefToRoute('https://example.com')).toBeNull()
    expect(wikiHrefToRoute('//upload.wikimedia.org/x.jpg')).toBeNull()
  })
  it('keeps percent-encoded titles intact', () => {
    expect(wikiHrefToRoute('./Caf%C3%A9')).toBe('#/w/article/Caf%C3%A9')
  })
})

describe('shouldStripSection', () => {
  it('strips reference-flavored sections', () => {
    for (const s of ['References', 'External links', 'See also', 'Further reading', 'NOTES']) {
      expect(shouldStripSection(s)).toBe(true)
    }
  })
  it('keeps real content sections', () => {
    for (const s of ['History', 'Early life', 'Design', 'Legacy']) {
      expect(shouldStripSection(s)).toBe(false)
    }
  })
})
