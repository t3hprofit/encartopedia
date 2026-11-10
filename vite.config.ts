import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Wikimedia asks interactive apps to cache; SWR for API JSON, CacheFirst for media.
const HOUR = 3600
const DAY = 24 * HOUR

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Encartopedia 95',
        short_name: 'Encartopedia',
        description:
          "An unofficial fan homage to Microsoft Encarta '95, powered by Wikipedia. Not affiliated with Microsoft.",
        theme_color: '#000000',
        background_color: '#f1e9d2',
        display: 'standalone',
        orientation: 'landscape-primary',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/(en\.wikipedia\.org|en\.wiktionary\.org|www\.wikidata\.org|api\.wikimedia\.org|commons\.wikimedia\.org)\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'wiki-api',
              expiration: { maxEntries: 600, maxAgeSeconds: 7 * DAY },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/(upload|thumb)\.wikimedia\.org\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'wiki-media',
              expiration: { maxEntries: 400, maxAgeSeconds: 30 * DAY },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/query\.wikidata\.org\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'wikidata-sparql',
              expiration: { maxEntries: 20, maxAgeSeconds: 30 * DAY },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-static',
              expiration: { maxEntries: 20, maxAgeSeconds: 90 * DAY },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
} as Parameters<typeof defineConfig>[0])
