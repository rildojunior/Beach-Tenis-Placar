/** Mantém a tela ligada enquanto o app estiver visível. */
export function keepScreenAwake() {
  if (!('wakeLock' in navigator)) return

  const request = () => navigator.wakeLock.request('screen').catch(() => undefined)

  request()
  document.addEventListener('visibilitychange', () => {
    // O navegador libera o bloqueio sozinho quando a aba fica oculta.
    if (document.visibilityState === 'visible') request()
  })
}

/** Apaga os caches do service worker antigo (anterior à migração para Vite). */
export async function removeLegacyCaches() {
  if (!('caches' in window)) return
  const keys = await caches.keys()
  await Promise.all(
    keys.filter(key => key.startsWith('btp-')).map(key => caches.delete(key))
  )
}

export const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true

export const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent)
