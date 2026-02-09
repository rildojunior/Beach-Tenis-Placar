import { state } from './state.js'
import { hideInstallPrompt, showInstallPrompt } from './ui.js'

export function setupInstall(refs) {
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault()
    state.deferredPrompt = event

    if (!localStorage.getItem('bt-install-dismissed')) {
      showInstallPrompt(refs)
    }
  })

  if (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  ) {
    refs.installPrompt?.remove()
  }

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const isInStandalone = window.navigator.standalone === true

  if (
    isIOS &&
    !isInStandalone &&
    !localStorage.getItem('bt-install-dismissed') &&
    refs.installPrompt
  ) {
    refs.installPrompt.querySelector('button').style.display = 'none'
    refs.installPrompt.querySelector('p:nth-child(2)').textContent =
      'No iPhone: compartilhar → Adicionar à Tela de Início'
    showInstallPrompt(refs)
  }
}

export async function installApp(refs) {
  if (!state.deferredPrompt) return

  state.deferredPrompt.prompt()
  const result = await state.deferredPrompt.userChoice

  state.deferredPrompt = null
  hideInstallPrompt(refs)

  if (result.outcome === 'dismissed') {
    localStorage.setItem('bt-install-dismissed', '1')
  }
}

export function dismissInstallPrompt(refs) {
  localStorage.setItem('bt-install-dismissed', '1')
  hideInstallPrompt(refs)
  state.deferredPrompt = null
}

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./service-worker.js')
      .catch(error => console.error('SW erro:', error))
  })

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  })
}
