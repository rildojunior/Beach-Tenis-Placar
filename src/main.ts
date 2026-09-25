import { mount } from 'svelte'
import { registerSW } from 'virtual:pwa-register'
import App from './App.svelte'
import { keepScreenAwake, removeLegacyCaches } from './lib/device'
import { persistState } from './stores/persist.svelte'
import './app.css'

persistState()
keepScreenAwake()
registerSW({ immediate: true })
removeLegacyCaches()

export default mount(App, { target: document.getElementById('app')! })
