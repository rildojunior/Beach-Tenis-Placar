import { execSync } from 'node:child_process'
import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

/** Versão exibida nas configurações: data do build + commit atual. */
function buildVersion(): string {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '.')
  try {
    const hash = execSync('git rev-parse --short HEAD').toString().trim()
    return `v${date}-${hash}`
  } catch {
    return `v${date}`
  }
}

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(buildVersion())
  },
  plugins: [
    svelte(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Mesmo nome do service worker antigo, para que instalações
      // existentes sejam atualizadas automaticamente para esta versão.
      filename: 'service-worker.js',
      includeAssets: ['favicon.ico', 'icon-192.png'],
      manifest: {
        name: 'Beach Tennis Placar',
        short_name: 'BeachTennis',
        start_url: '/',
        display: 'standalone',
        background_color: '#000000',
        theme_color: '#000000',
        orientation: 'portrait',
        lang: 'pt-BR',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-css' }
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
  ],
  test: {
    include: ['src/**/*.test.ts']
  }
})
