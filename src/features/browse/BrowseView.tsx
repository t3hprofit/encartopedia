import { useParams } from 'react-router-dom'
import { areaById } from '../../theme/areas'

/** Phase 2 replaces this with live category browsing. */
export function BrowseView() {
  const { areaId, subIdx } = useParams()
  const area = areaById(areaId)
  const sub = subIdx !== undefined ? area?.subcategories[Number(subIdx)] : undefined
  return (
    <>
      <div className="e-banner" style={area ? { borderBottom: `3px solid ${area.accent}` } : undefined}>
        {area?.label ?? 'Browse'} {sub && <small>{sub.label}</small>}
      </div>
      <div className="e-page-scroll">
        <div className="e-welcome">
          <p>Category browsing arrives in Phase 2.</p>
        </div>
      </div>
    </>
  )
}
