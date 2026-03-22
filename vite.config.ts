import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png'],
      // Don't register SW in mobile/Capacitor builds
      selfDestroying: mode === 'mobile',
      manifest: {
        name: 'BandBajaBudget',
        short_name: 'BandBajaBudget',
        description: 'Track wedding expenses with your family — together',
        theme_color: '#4A0080',
        background_color: '#0f0a1e',
        display: 'standalone',
        orientation: 'portrait',
        scope: mode === 'mobile' ? '/' : '/wedding-expense/',
        start_url: mode === 'mobile' ? '/' : '/wedding-expense/',
        icons: [
          {
            src: '/wedding-expense/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/wedding-expense/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/wedding-expense/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Cache all static assets
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Runtime caching for Firebase API calls
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firebase-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
    }),
  ],
  // Use /wedding-expense/ for GitHub Pages, / for native mobile builds
  base: mode === 'mobile' ? '/' : '/wedding-expense/',
}))
