import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initAnalytics } from './lib/analytics'
import './theme/palette.css'
import './ui/ui.css'

initAnalytics()

// Boot egg — a real quote about MindMaze v1.
console.log('%c"the slowest thing I have ever seen!!" — BG, on MindMaze v1', 'color:#d4af37;font-style:italic')
console.log('%cENCARTOPEDIA ’95 · code name: Gandalf · Version 95 (Build 2026)', 'color:#8f1a1a')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
