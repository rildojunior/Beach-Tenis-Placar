// Alterar SOMENTE este valor a cada deploy (ex: v2026.02.09-1, v2026.02.10-1).
// Isso força o navegador a instalar a nova versão do Service Worker.
const SW_VERSION = 'v2026.02.19-1'

const APP_CACHE_PREFIX = `btp-app-${SW_VERSION}-`
const RUNTIME_CACHE_PREFIX = `btp-runtime-${SW_VERSION}-`

const APP_SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './assets/css/style.css',
  './assets/js/app.js',
  './assets/js/state.js',
  './assets/js/storage.js',
  './assets/js/ui.js',
  './assets/js/history.js',
  './assets/js/install.js'
]

const HASH_SOURCE_FILES = [
  './index.html',
  './manifest.json',
  './assets/css/style.css',
  './assets/js/app.js',
  './assets/js/state.js',
  './assets/js/storage.js',
  './assets/js/ui.js',
  './assets/js/history.js',
  './assets/js/install.js'
]

const cacheNamesPromise = buildCacheNames()

self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const { app } = await cacheNamesPromise
      const cache = await caches.open(app)

      await cache.addAll(APP_SHELL_FILES)
      await self.skipWaiting()
    })()
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const { app, runtime } = await cacheNamesPromise
      const keys = await caches.keys()

      await Promise.all(
        keys
          .filter(key => {
            const isAppCache = key.startsWith(APP_CACHE_PREFIX)
            const isRuntimeCache = key.startsWith(RUNTIME_CACHE_PREFIX)

            if (!isAppCache && !isRuntimeCache) return false
            return key !== app && key !== runtime
          })
          .map(key => caches.delete(key))
      )

      await self.clients.claim()
    })()
  )
})

self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET') return

  event.respondWith(handleRequest(request))
})

async function handleRequest(request) {
  const { app, runtime } = await cacheNamesPromise
  const url = new URL(request.url)

  if (isRuntimeAsset(url)) {
    return staleWhileRevalidate(request, runtime)
  }

  if (url.origin !== self.location.origin) {
    return fetch(request)
  }

  if (request.mode === 'navigate') {
    try {
      return await fetch(request)
    } catch {
      const cache = await caches.open(app)
      return (
        (await cache.match('./index.html')) ||
        (await cache.match('./')) ||
        Response.error()
      )
    }
  }

  const appCache = await caches.open(app)
  const cached = await appCache.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (isCacheable(response)) {
      const runtimeCache = await caches.open(runtime)
      runtimeCache.put(request, response.clone())
    }
    return response
  } catch {
    const runtimeCache = await caches.open(runtime)
    return runtimeCache.match(request) || Response.error()
  }
}

function isRuntimeAsset(url) {
  return (
    url.origin === 'https://cdn.tailwindcss.com' ||
    url.origin === 'https://fonts.googleapis.com' ||
    url.origin === 'https://fonts.gstatic.com'
  )
}

function isCacheable(response) {
  return Boolean(response && response.ok)
}

async function staleWhileRevalidate(request, runtimeCacheName) {
  const runtimeCache = await caches.open(runtimeCacheName)
  const cached = await runtimeCache.match(request)

  const networkRequest = fetch(request)
    .then(response => {
      if (isCacheable(response)) {
        runtimeCache.put(request, response.clone())
      }
      return response
    })
    .catch(() => cached || Response.error())

  return cached || networkRequest
}

async function buildCacheNames() {
  const hash = await buildContentHash()
  return {
    app: `${APP_CACHE_PREFIX}${hash}`,
    runtime: `${RUNTIME_CACHE_PREFIX}${hash}`
  }
}

async function buildContentHash() {
  const buffers = []

  for (const file of HASH_SOURCE_FILES) {
    const response = await fetch(new Request(file, { cache: 'no-store' }))
    if (!response.ok) {
      throw new Error(`Falha ao gerar hash de build para: ${file}`)
    }

    const bytes = new Uint8Array(await response.arrayBuffer())
    buffers.push(bytes)
  }

  const merged = joinUint8Arrays(buffers)
  const digest = await crypto.subtle.digest('SHA-256', merged)
  return toHex(new Uint8Array(digest)).slice(0, 16)
}

function joinUint8Arrays(parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0)
  const result = new Uint8Array(total)

  let offset = 0
  for (const part of parts) {
    result.set(part, offset)
    offset += part.length
  }

  return result
}

function toHex(bytes) {
  return [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('')
}
