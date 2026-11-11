import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { trackPageView } from './lib/analytics'
import { Shell } from './shell/Shell'
import { Splash, shouldSkipSplash } from './features/splash/Splash'
import { Welcome } from './features/home/Welcome'
import { ArticleView } from './features/article/ArticleView'
import { BrowseView } from './features/browse/BrowseView'
import { AtlasView } from './features/atlas/AtlasView'
import { TimelineView } from './features/timeline/TimelineView'
import { GalleryView } from './features/gallery/GalleryView'
import { MindMaze } from './features/mindmaze/MindMaze'

/** Reports every route change (and the initial route) to analytics. */
function PageViewTracker() {
  const location = useLocation()
  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname])
  return null
}

export function App() {
  return (
    <HashRouter>
      <PageViewTracker />
      <Routes>
        <Route path="/" element={shouldSkipSplash() ? <Navigate to="/w" replace /> : <Splash />} />
        <Route path="/w" element={<Shell />}>
          <Route index element={<Welcome />} />
          <Route path="article/:title" element={<ArticleView />} />
          <Route path="browse/:areaId" element={<BrowseView />} />
          <Route path="browse/:areaId/:subIdx" element={<BrowseView />} />
          <Route path="atlas" element={<AtlasView />} />
          <Route path="timeline" element={<TimelineView />} />
          <Route path="gallery" element={<GalleryView />} />
          <Route path="mindmaze" element={<MindMaze />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
