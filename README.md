# Encartopedia '95

**The Complete Interactive Multimedia Encyclopedia** — a pixel-faithful fan recreation of
Microsoft Encarta '95, running as a PWA and powered by live Wikipedia/Wikimedia data instead
of a CD-ROM.

**Live:** https://t3hprofit.github.io/encartopedia/

> An unofficial fan homage. Not affiliated with Microsoft. Version 95 (Build 2026). Code name: Gandalf.

## What's on the disc

- **The flat, dark UI Encarta actually had** — black custom chrome, parchment pages, maroon
  hyperlinks, per-category accent colors and line-art watermarks. (Encarta '95 drew its own
  Windows-95-style windowing a year before Windows 95 shipped.)
- **Pinpointer** — floating word-wheel search with Word / Category / Media / Time / Place
  filters, spell suggestions, and a Wizard. Time understands BC; Place lists articles within
  10 km of anywhere.
- **Articles** — live Wikipedia (Parsoid HTML, restyled), outline pane, Related Articles,
  pronunciation audio, image Caption dialogs with full credits, CC BY-SA attribution.
- **Atlas** — pastel Natural Earth world map, click-to-zoom, Scale & Legend, country facts
  and flags from one cached Wikidata query. National anthems play on country articles
  (Copy Audio is disabled for anthems; this behavior is by design — KB Q133169).
- **Timeline** — 15,000,000 BC to the present, mammoth to Space Shuttle, plus a live
  "On This Day" strip.
- **Media Gallery** — Pictures of the Day and per-article media browsing.
- **MindMaze** — the castle of King Miser the First: five 10×10 maze floors, timed
  4-choice questions generated live from the encyclopedia, two attempts per door, five
  matches, 20,000 points to the throne room. Every answer is an article; the rabbit hole
  is the point.
- **Tools** — Dictionary & Thesaurus (Wiktionary), Notemark, Back List, Word Processor
  (REPORT.DOC), and the Browse Panel with Random and A–Z.
- Several easter eggs, at least one of which requires Shift+Ctrl and a right mouse button,
  and one of which is Ctrl+Z.

## Running it

```sh
npm install
npm run dev      # dev server
npm test         # vitest unit tests
npm run build    # type-check + production build (dist/)
```

Pure client-side: no backend, no API keys. Wikimedia APIs are called directly with CORS,
identified via `Api-User-Agent`, cached by a Workbox service worker (stale-while-revalidate
for API JSON, cache-first for media). Deployed to GitHub Pages by `.github/workflows/deploy.yml`;
PRs are validated by `.github/workflows/ci.yml`.

## Licensing

- Code: MIT.
- Article text: [Wikipedia](https://en.wikipedia.org), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) — attributed in every article footer.
- Images/audio: individually licensed; credits shown in each Caption dialog (Wikimedia Commons `extmetadata`).
- Country/structured facts: [Wikidata](https://www.wikidata.org) (CC0). Map geometry: [Natural Earth](https://www.naturalearthdata.com/) (public domain).
- All UI art and sounds are original recreations in the spirit of the era — no Encarta assets were ripped.
