import { WatermarkKind } from './areas'

/** Large pale line-art watermark in the article margin, themed to the
 *  article's Area of Interest — one of Encarta 95's signature touches. */
export function Watermark({ kind }: { kind: WatermarkKind }) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden
      style={{
        position: 'absolute',
        top: 24,
        right: 18,
        width: 'min(34vmin, 300px)',
        height: 'min(34vmin, 300px)',
        pointerEvents: 'none',
        stroke: 'var(--e-watermark)',
        fill: 'none',
        strokeWidth: 2.4,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }}
    >
      {PATHS[kind]}
    </svg>
  )
}

const PATHS: Record<WatermarkKind, JSX.Element> = {
  gear: (
    <>
      <circle cx="50" cy="50" r="22" />
      <circle cx="50" cy="50" r="9" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4
        const x1 = 50 + 22 * Math.cos(a)
        const y1 = 50 + 22 * Math.sin(a)
        const x2 = 50 + 32 * Math.cos(a)
        const y2 = 50 + 32 * Math.sin(a)
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
      })}
    </>
  ),
  leaf: (
    <>
      <path d="M50 90 C 20 70, 20 30, 50 10 C 80 30, 80 70, 50 90 Z" />
      <path d="M50 88 V 14 M50 60 Q 36 54 30 40 M50 60 Q 64 54 70 40 M50 36 Q 42 32 38 24 M50 36 Q 58 32 62 24" />
    </>
  ),
  globe: (
    <>
      <circle cx="50" cy="50" r="34" />
      <ellipse cx="50" cy="50" rx="14" ry="34" />
      <ellipse cx="50" cy="50" rx="27" ry="34" />
      <path d="M16 50 h68 M22 32 h56 M22 68 h56" />
    </>
  ),
  column: (
    <>
      <path d="M30 86 h40 M33 80 h34 M35 26 h30 M31 20 h38 M28 14 h44" />
      <path d="M38 26 v54 M46 26 v54 M54 26 v54 M62 26 v54" />
      <path d="M31 20 q4 -6 8 0 M43 20 q4 -6 8 0 M55 20 q4 -6 8 0" />
    </>
  ),
  quill: (
    <>
      <path d="M74 12 C 50 20, 34 44, 28 72 L 26 80 L 34 76 C 58 64, 72 38, 74 12 Z" />
      <path d="M30 70 C 44 52, 56 36, 70 18 M24 88 l6 -10" />
    </>
  ),
  lamp: (
    <>
      <path d="M30 60 q-8 -14 2 -24 q-2 -10 10 -12 q6 -10 18 -6 q12 -4 16 8 q10 4 6 16 q6 10 -4 18" />
      <path d="M44 60 v12 h12 v-12 M40 78 h20 M44 86 h12" />
      <path d="M50 24 v-8 M36 30 l-6 -6 M64 30 l6 -6" />
    </>
  ),
  brush: (
    <>
      <path d="M22 86 C 30 70, 60 34, 76 16 M72 12 l8 8" />
      <path d="M22 86 q-4 -10 6 -12 q2 8 -6 12 Z" />
      <path d="M40 64 l8 8 M54 48 l8 8" />
    </>
  ),
  mask: (
    <>
      <path d="M28 20 q22 -10 44 0 q4 28 -8 44 q-10 14 -14 14 q-4 0 -14 -14 q-12 -16 -8 -44 Z" />
      <path d="M38 38 q6 -4 10 0 M52 38 q6 -4 10 0" />
      <path d="M40 58 q10 10 20 0" />
    </>
  ),
  ball: (
    <>
      <circle cx="50" cy="50" r="32" />
      <path d="M50 18 q16 32 0 64 M50 18 q-16 32 0 64 M20 38 h60 M20 62 h60" />
    </>
  ),
}
