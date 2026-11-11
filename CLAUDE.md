# Encartopedia 95 — context for Claude sessions

Pixel-faithful fan recreation of Microsoft Encarta '95 as a client-side PWA, powered by live
Wikimedia APIs. React 18 + Vite 6 + TypeScript, no backend, no API keys.

- Live: https://encartopedia.com (GoDaddy DNS → GitHub Pages; also t3hprofit.github.io/encartopedia)
- Repo: https://github.com/t3hprofit/encartopedia · deploys on every push to `main` (.github/workflows/deploy.yml); PRs validated by ci.yml
- Commands: `npm run dev` (port 5173) · `npm test` (vitest) · `npm run build` (tsc --noEmit + vite build)

## Design law (fidelity decisions — do not "modernize")

- Encarta '95 had a **flat, dark custom UI**, NOT Win3.1 gray bevels: black chrome, parchment
  content (`--e-parchment`) on black backdrop, maroon links (`--e-link`), putty buttons, thin flat
  scrollbars. Tokens in `src/theme/palette.css`; 9 Areas of Interest with accent colors + watermarks
  in `src/theme/areas.ts`.
- Anachronisms to REJECT (those are Encarta 96+): icon-grid home launchpad, 3-D globe atlas,
  InterActivities menu, Web Links, Guided Tours.
- Features menu = exactly 4 items: Atlas, Media Gallery, Timeline, MindMaze. Tools menu: Browse
  Panel, Dictionary Thesaurus, Notemark, Back List, Word Processor.
- All art/sounds are **original recreations** (hand-written SVG, WebAudio synth in `src/sfx/audio.ts`)
  — never rip Encarta assets. Reference for side-by-side checks: the real ISO runs at
  https://benwinding.github.io/encarta_95_web
- The site is **locked to light rendering** (`color-scheme: only light` + `darkreader-lock` meta in
  index.html) because forced dark modes wrecked the parchment dialogs. Keep it.
- Easter eggs are load-bearing: Shift+Ctrl+right-click About picture (team photo), Ctrl+Z → MindMaze,
  anthem Copy button disabled (KB Q133169), Gates "Editor's Choice", console boot quote,
  splash '95 struck through with glowing '26.

## Wikimedia API facts (live-verified; violating these causes real breakage)

- **Always send `Api-User-Agent`** (wrapper in `src/api/client.ts` does) — anonymous requests got
  429'd in testing. Browser tier: 200 req/min. Debounce search ~250-300 ms with AbortController.
- Article HTML: Parsoid `api/rest_v1/page/html/{title}`; slice `<section data-mw-section-id>`;
  rewrite `./Title` hrefs (`src/lib/wikitext.ts`). `page/mobile-sections` is DEAD (403).
- Thumbnails: only standard widths work for hand-built URLs (20/40/60/120/250/330/500/960/1280/1920/3840
  px); others return 400. API-provided URLs are safe.
- Timeline/on-this-day: use `feed/onthisday/...`; naive month/day Wikidata SPARQL **times out (504)**.
- Country facts: one cached SPARQL query (localStorage, 30 d) in `src/api/atlas.ts`; geometry from
  `world-atlas@2` TopoJSON (jsDelivr). REST Countries API is dead/keyed — do not use.
- CirrusSearch: `articletopic:` values validated (see `AREA_TOPICS` in `src/api/pinpointer.ts`);
  `srsort=incoming_links_desc` + `sroffset` tiers = MindMaze question pools by difficulty.
- Audio: Commons OGG + MP3 transcode fallback (`transcodedMp3Url` in `src/api/media.ts`);
  pronunciations via Wikidata P443, anthems P85→P51.
- Attribution is mandatory: CC BY-SA 4.0 footer on articles, per-file credits in Caption dialogs.

## Hard-won gotchas

- **gtag.js ignores plain arrays** pushed to dataLayer — the stub must push real `arguments`
  objects (`src/lib/analytics.ts`). Symptom: script loads, zero hits, no `_ga` cookies.
- GA4 id `G-DN1FP2LK0Z` lives in `src/config.ts`; loading is gated behind the cookie-consent banner
  (`src/features/consent/`) — GA must never load pre-consent; DNT/GPC users are never asked.
- **Dialogs mount inside `.e-titlebar`'s DOM** — title-bar CSS must stay scoped to direct children
  (`.e-titlebar > button:not(.e-titlebar-name)`), or dialog buttons get clobbered.
- Nested-SVG components need explicit `width`/`height` attributes (not just CSS) or they blow up to
  100% of the parent viewport (see `CharacterFigure`).
- GitHub Pages custom-domain certs: **do not re-save the cname to "nudge" provisioning** — every
  PUT restarts the Let's Encrypt request. Set it once, leave it alone. Health check:
  `gh api repos/t3hprofit/encartopedia/pages/health`.
- Windows PowerShell 5.1 mangles JSON piped to `gh api --input -`; use the Bash tool for that.
- After deploys, the PWA service worker may need a second refresh to swap the app shell.

## Verification workflow

Chrome MCP tools against `npm run dev` (localhost:5173): screenshot per feature, zoom for art
detail, `read_network_requests`/`javascript_tool` for analytics-type debugging. MindMaze logic
(maze gen, scoring) and wikitext href rewriting have vitest coverage — keep `npm test` green.
Full feature research + API survey live in the plan file at
`C:\Users\media\.claude\plans\partitioned-forging-lampson.md` (local machine only).
