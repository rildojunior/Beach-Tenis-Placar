import { mount } from 'svelte'
import { registerSW } from 'virtual:pwa-register'
import App from './App.svelte'
import { keepScreenAwake, removeLegacyCaches } from './lib/device'
import { SPRING_DEFAULT, SPRING_SNAPPY, springCss } from './lib/spring'
import { persistState } from './stores/persist.svelte'
import './app.css'

// Curvas de mola usadas pelas transições em CSS (mesma física das animações em JS).
const root = document.documentElement.style
const soft = springCss(SPRING_DEFAULT)
const snappy = springCss(SPRING_SNAPPY)
if (CSS.supports('transition-timing-function', 'linear(0, 1)')) {
  root.setProperty('--ease-spring', soft.easing)
  root.setProperty('--ease-spring-snappy', snappy.easing)
}
root.setProperty('--spring-duration', soft.duration)
root.setProperty('--spring-snappy-duration', snappy.duration)

// No Safari do iPhone, :active só funciona com algum listener de toque na página.
document.addEventListener('touchstart', () => {}, { passive: true })

persistState()
keepScreenAwake()
registerSW({ immediate: true })
removeLegacyCaches()

export default mount(App, { target: document.getElementById('app')! })
