import { state } from './state.js'

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

export function loadTeamNames() {
  const saved = safeParse(localStorage.getItem('bt-team-names'), null)
  if (!saved) return

  state.teamNames = {
    ...state.teamNames,
    ...saved
  }
}

export function saveTeamNames() {
  localStorage.setItem('bt-team-names', JSON.stringify(state.teamNames))
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
