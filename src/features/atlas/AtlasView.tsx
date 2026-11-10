import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { geoNaturalEarth1, geoPath, GeoPermissibleObjects } from 'd3-geo'
import { feature } from 'topojson-client'
import type { FeatureCollection, Geometry } from 'geojson'
import { getCountries, getWorldTopology, CountryFact } from '../../api/atlas'
import { titleToPath } from '../../api/client'
import { playClick } from '../../sfx/audio'
import './atlas.css'

const W = 960
const H = 520

/** Encarta's light pastel political palette. */
const PASTELS = ['#cfe3c2', '#f2d9b0', '#dcc9e0', '#c8dcec', '#f0c9c0', '#ece6b8', '#c9e4de', '#e6d2be']

interface CountryFeature {
  id?: string | number
  properties?: { name?: string }
  geometry: Geometry
  type: 'Feature'
}

export function AtlasView() {
  const [world, setWorld] = useState<FeatureCollection | null>(null)
  const [facts, setFacts] = useState<Map<string, CountryFact>>(new Map())
  const [selected, setSelected] = useState<CountryFeature | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [legendOpen, setLegendOpen] = useState(true)
  const [error, setError] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const ctl = new AbortController()
    getWorldTopology(ctl.signal)
      .then((topo) => setWorld(feature(topo as never, (topo as never as { objects: { countries: never } }).objects.countries) as unknown as FeatureCollection))
      .catch(() => !ctl.signal.aborted && setError(true))
    getCountries(ctl.signal)
      .then((list) => {
        const m = new Map<string, CountryFact>()
        for (const c of list) if (c.isoNumeric) m.set(c.isoNumeric, c)
        setFacts(m)
      })
      .catch(() => {})
    return () => ctl.abort()
  }, [])

  const projection = useMemo(() => {
    const p = geoNaturalEarth1()
    if (selected) {
      p.fitExtent(
        [
          [40, 40],
          [W - 40, H - 40],
        ],
        selected as GeoPermissibleObjects,
      )
    } else if (world) {
      p.fitSize([W, H], world as GeoPermissibleObjects)
    }
    return p
  }, [world, selected])

  const path = useMemo(() => geoPath(projection), [projection])

  // approximate scale bar: measure 500km along the equator-ish center of view
  const scaleBar = useMemo(() => {
    const kmPerDeg = 111.32
    const degFor500 = 500 / kmPerDeg
    const c = selected ? (path.centroid(selected as GeoPermissibleObjects) as [number, number]) : [W / 2, H / 2]
    const inv = projection.invert?.(c as [number, number])
    if (!inv) return null
    const a = projection([inv[0] - degFor500 / 2, inv[1]])
    const b = projection([inv[0] + degFor500 / 2, inv[1]])
    if (!a || !b) return null
    return Math.abs(b[0] - a[0])
  }, [projection, path, selected])

  const factFor = (f: CountryFeature): CountryFact | undefined =>
    facts.get(String(f.id).padStart(3, '0'))

  const select = (f: CountryFeature | null) => {
    playClick()
    setSelected(f)
  }

  const selectedFact = selected ? factFor(selected) : undefined

  return (
    <>
      <div className="e-banner">
        Atlas{' '}
        <small>{selected ? (selectedFact?.name ?? selected.properties?.name ?? '').toUpperCase() : 'THE WORLD'}</small>
        {selected && (
          <button className="e-say" onClick={() => select(null)}>
            ◀ World Map
          </button>
        )}
        <button className="e-say" onClick={() => setLegendOpen((o) => !o)}>
          Scale &amp; Legend
        </button>
      </div>
      <div className="e-atlas-wrap">
        {error && <div className="e-article-status">The map drawer is stuck. Check your connection and try again.</div>}
        {!world && !error && <div className="e-article-status">Unrolling the map…</div>}
        {world && (
          <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="e-atlas-map">
            <rect width={W} height={H} fill="#b8d4e4" />
            {(world.features as CountryFeature[]).map((f, i) => {
              const d = path(f as GeoPermissibleObjects)
              if (!d) return null
              const id = String(f.id)
              const isSel = selected && String(selected.id) === id
              const n = Math.abs(Number(f.id))
              const pastel = PASTELS[Number.isFinite(n) ? n % PASTELS.length : i % PASTELS.length]
              return (
                <path
                  key={`${id}-${i}`}
                  d={d}
                  className={`e-atlas-country ${isSel ? 'sel' : ''} ${hovered === id ? 'hov' : ''}`}
                  fill={isSel ? '#f6eeb8' : pastel}
                  onMouseEnter={() => setHovered(id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => select(f)}
                >
                  <title>{factFor(f)?.name ?? f.properties?.name}</title>
                </path>
              )
            })}
          </svg>
        )}
        {legendOpen && world && (
          <div className="e-atlas-legend">
            <div className="e-atlas-legend-title">SCALE &amp; LEGEND</div>
            {scaleBar && (
              <div className="e-atlas-scale">
                <span className="bar" style={{ width: Math.min(scaleBar, 160) }} />
                <span>500 km</span>
              </div>
            )}
            <div className="e-atlas-key">
              <span className="swatch" style={{ background: '#b8d4e4' }} /> Ocean
              <span className="swatch" style={{ background: '#cfe3c2' }} /> Nations (pastel)
              <span className="swatch" style={{ background: '#f6eeb8' }} /> Selected
            </div>
            <div style={{ fontSize: 10, color: 'var(--e-ink-soft)' }}>
              Click a nation to zoom. Geometry: Natural Earth (PD). Facts: Wikidata (CC0).
            </div>
          </div>
        )}
        {selected && (
          <div className="e-atlas-card">
            <div className="e-atlas-card-name">{selectedFact?.name ?? selected.properties?.name}</div>
            {selectedFact?.flagUrl && <img src={selectedFact.flagUrl} alt="Flag" />}
            <table>
              <tbody>
                {selectedFact?.capital && (
                  <tr>
                    <td>Capital</td>
                    <td>{selectedFact.capital}</td>
                  </tr>
                )}
                {selectedFact?.population && (
                  <tr>
                    <td>Population</td>
                    <td>{selectedFact.population.toLocaleString()}</td>
                  </tr>
                )}
                {selectedFact?.iso2 && (
                  <tr>
                    <td>ISO</td>
                    <td>{selectedFact.iso2}</td>
                  </tr>
                )}
              </tbody>
            </table>
            {(selectedFact?.articleTitle ?? selected.properties?.name) && (
              <Link
                className="e-btn"
                to={`/w/article/${titleToPath(selectedFact?.articleTitle ?? selected.properties!.name!)}`}
              >
                Go to Article ▶
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  )
}
