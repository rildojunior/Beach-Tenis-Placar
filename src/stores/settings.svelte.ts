import { loadSettings } from '../lib/storage'
import type { Settings } from '../lib/types'

export const settings: Settings = $state(loadSettings())
