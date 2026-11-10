import { useParams } from 'react-router-dom'
import { pathToTitle } from '../../api/client'

/** Phase 2 replaces this with the full Parsoid-backed article view. */
export function ArticleView() {
  const { title = '' } = useParams()
  return (
    <>
      <div className="e-banner">{pathToTitle(title)}</div>
      <div className="e-page-scroll">
        <div className="e-welcome">
          <p>The article view arrives in Phase 2 — outline pane, red links, watermarks and all.</p>
        </div>
      </div>
    </>
  )
}
