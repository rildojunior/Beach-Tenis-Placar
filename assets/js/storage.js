import { state } from './state.js'

const DEFAULT_TEAM_PRESETS = [
  { id: 'default-a', name: 'Time A', locked: true },
  { id: 'default-b', name: 'Time B', locked: true }
]

function safeParse(value, fallback) {
  if (!value) return fallback

  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

export function loadSettings() {
  const saved = safeParse(localStorage.getItem('bt-settings'), null)

  if (saved) {
    state.settings = {
      ...state.settings,
      ...saved
    }
    return
  }

  saveSettings()
}

export function saveSettings() {
  localStorage.setItem('bt-settings', JSON.stringify(state.settings))
}

function normalizePreset(rawPreset) {
  if (!rawPreset || typeof rawPreset !== 'object') return null

  const id = typeof rawPreset.id === 'string' ? rawPreset.id.trim() : ''
  const name = typeof rawPreset.name === 'string' ? rawPreset.name.trim() : ''
  if (!id || !name) return null

  return {
    id,
    name,
    locked: id === 'default-a' || id === 'default-b'
  }
}

function mergeDefaultPresets(presets) {
  const byId = new Map()

  presets.forEach(preset => {
    byId.set(preset.id, preset)
  })

  DEFAULT_TEAM_PRESETS.forEach(defaultPreset => {
    byId.set(defaultPreset.id, defaultPreset)
  })

  return [...byId.values()]
}

export function loadTeams() {
  const saved = safeParse(localStorage.getItem('bt-teams'), null)

  if (saved && Array.isArray(saved.presets)) {
    const normalizedPresets = saved.presets
      .map(normalizePreset)
      .filter(Boolean)
    const presets = mergeDefaultPresets(normalizedPresets)

    state.teamPresets = presets

    const availableIds = new Set(presets.map(preset => preset.id))
    const nextSelection = {
      A:
        typeof saved.selection?.A === 'string' &&
        availableIds.has(saved.selection.A)
          ? saved.selection.A
          : 'default-a',
      B:
        typeof saved.selection?.B === 'string' &&
        availableIds.has(saved.selection.B)
          ? saved.selection.B
          : 'default-b'
    }

    if (nextSelection.A === nextSelection.B) {
      nextSelection.B = nextSelection.A === 'default-a' ? 'default-b' : 'default-a'
    }

    state.teamSelection = nextSelection
    syncTeamNamesFromSelection()
    saveTeams()
    return
  }

  const legacyTeamNames = safeParse(localStorage.getItem('bt-team-names'), null)
  if (
    legacyTeamNames &&
    typeof legacyTeamNames.A === 'string' &&
    typeof legacyTeamNames.B === 'string'
  ) {
    const legacyA = legacyTeamNames.A.trim()
    const legacyB = legacyTeamNames.B.trim()

    const presets = [...DEFAULT_TEAM_PRESETS]
    let selectionA = 'default-a'
    let selectionB = 'default-b'

    if (legacyA && legacyA !== 'Time A') {
      const idA = `team-${Date.now()}-a`
      presets.push({ id: idA, name: legacyA, locked: false })
      selectionA = idA
    }

    if (legacyB && legacyB !== 'Time B') {
      const idB = `team-${Date.now()}-b`
      presets.push({ id: idB, name: legacyB, locked: false })
      selectionB = idB
    }

    if (selectionA === selectionB) {
      selectionB = 'default-b'
    }

    state.teamPresets = presets
    state.teamSelection = { A: selectionA, B: selectionB }
    syncTeamNamesFromSelection()
    saveTeams()
    localStorage.removeItem('bt-team-names')
    return
  }

  state.teamPresets = [...DEFAULT_TEAM_PRESETS]
  state.teamSelection = { A: 'default-a', B: 'default-b' }
  syncTeamNamesFromSelection()
  saveTeams()
}

export function saveTeams() {
  localStorage.setItem(
    'bt-teams',
    JSON.stringify({
      presets: state.teamPresets,
      selection: state.teamSelection
    })
  )
}

export function syncTeamNamesFromSelection() {
  const findName = presetId =>
    state.teamPresets.find(preset => preset.id === presetId)?.name || ''

  const nameA = findName(state.teamSelection.A)
  const nameB = findName(state.teamSelection.B)

  state.teamNames.A = nameA || 'Time A'
  state.teamNames.B = nameB || 'Time B'
}

export function loadScore() {
  const saved = safeParse(localStorage.getItem('bt-score'), null)
  if (!saved) return

  state.score = {
    ...state.score,
    ...saved
  }
}

export function saveScore() {
  localStorage.setItem('bt-score', JSON.stringify(state.score))
}

export function loadHistory() {
  const saved = safeParse(localStorage.getItem('bt-history'), null)
  if (!Array.isArray(saved)) return
  state.matchHistory = saved
}

export function saveHistory() {
  localStorage.setItem('bt-history', JSON.stringify(state.matchHistory))
}

export function clearHistoryStorage() {
  localStorage.removeItem('bt-history')
}
