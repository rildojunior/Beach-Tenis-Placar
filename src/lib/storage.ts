/**
 * Leitura e gravação no localStorage.
 *
 * As chaves e o formato são os mesmos da versão anterior do app, então os
 * dados já salvos nos celulares continuam funcionando. Cada `load*` também
 * migra formatos antigos (ex.: `setsA` → `gamesA`).
 */
import {
  defaultColorsFor,
  firstFreePaletteId,
  normalizeTeamColors,
  paletteColors
} from './palettes'
import { sanitizeGamesToWin } from './scoring'
import type {
  MatchRecord,
  Score,
  Settings,
  TeamKey,
  TeamPreset,
  TeamSelection
} from './types'

export const STORAGE_KEYS = {
  settings: 'bt-settings',
  teams: 'bt-teams',
  legacyTeamNames: 'bt-team-names',
  score: 'bt-score',
  history: 'bt-history',
  installDismissed: 'bt-install-dismissed'
} as const

type Json = Record<string, unknown>

function read(storage: Storage, key: string): unknown {
  const value = storage.getItem(key)
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const asObject = (value: unknown): Json | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Json) : null

const num = (...values: unknown[]): number | undefined =>
  values.find((value): value is number => typeof value === 'number')

export function save(key: string, value: unknown, storage: Storage = localStorage) {
  storage.setItem(key, JSON.stringify(value))
}

// ---------- Configurações ----------

export const DEFAULT_SETTINGS: Settings = {
  scoringMode: 'official',
  gamesEnabled: false,
  gamesToWin: 3
}

export function loadSettings(storage: Storage = localStorage): Settings {
  const saved = asObject(read(storage, STORAGE_KEYS.settings))
  if (!saved) return { ...DEFAULT_SETTINGS }

  const gamesEnabled = [saved.gamesEnabled, saved.setsEnabled].find(
    (value): value is boolean => typeof value === 'boolean'
  )
  const gamesToWin = num(saved.gamesToWin, saved.setsToWin)

  return {
    scoringMode: saved.scoringMode === 'simplified' ? 'simplified' : 'official',
    gamesEnabled: gamesEnabled ?? DEFAULT_SETTINGS.gamesEnabled,
    gamesToWin:
      gamesToWin === undefined
        ? DEFAULT_SETTINGS.gamesToWin
        : sanitizeGamesToWin(gamesToWin)
  }
}

// ---------- Placar ----------

export function loadScore(storage: Storage = localStorage): Score {
  const saved = asObject(read(storage, STORAGE_KEYS.score)) ?? {}
  return {
    pointsA: num(saved.pointsA) ?? 0,
    pointsB: num(saved.pointsB) ?? 0,
    gamesA: num(saved.gamesA, saved.setsA) ?? 0,
    gamesB: num(saved.gamesB, saved.setsB) ?? 0
  }
}

// ---------- Times ----------

export const DEFAULT_PRESETS: readonly TeamPreset[] = [
  { id: 'default-a', name: 'Time A', locked: true, colors: paletteColors(0) },
  { id: 'default-b', name: 'Time B', locked: true, colors: paletteColors(1) }
]

const DEFAULT_SELECTION: TeamSelection = { A: 'default-a', B: 'default-b' }

export interface TeamsData {
  presets: TeamPreset[]
  selection: TeamSelection
}

function parsePreset(raw: unknown): TeamPreset | null {
  const value = asObject(raw)
  if (!value) return null

  const id = typeof value.id === 'string' ? value.id.trim() : ''
  const name = typeof value.name === 'string' ? value.name.trim() : ''
  if (!id || !name) return null

  return {
    id,
    name,
    locked: id === 'default-a' || id === 'default-b',
    colors: normalizeTeamColors(value.colors, defaultColorsFor(id))
  }
}

/** Cada time precisa de uma paleta diferente. Repetidas recebem a próxima livre. */
export function ensureUniqueColors(presets: TeamPreset[]): TeamPreset[] {
  const used = new Set<string>()

  return presets.map(preset => {
    const colors = normalizeTeamColors(preset.colors, defaultColorsFor(preset.id))
    const paletteId =
      colors.paletteId && !used.has(colors.paletteId)
        ? colors.paletteId
        : firstFreePaletteId(used)

    if (!paletteId) return { ...preset, colors }
    used.add(paletteId)
    return { ...preset, colors: normalizeTeamColors({ paletteId }) }
  })
}

/** Garante que os dois times padrão existam, sem perder a cor escolhida para eles. */
function withDefaultPresets(presets: TeamPreset[]): TeamPreset[] {
  const ids = new Set(presets.map(preset => preset.id))
  const missing = DEFAULT_PRESETS.filter(preset => !ids.has(preset.id))
  return [...missing.map(preset => ({ ...preset })), ...presets]
}

function validSelection(raw: unknown, presets: TeamPreset[]): TeamSelection {
  const saved = asObject(raw) ?? {}
  const ids = new Set(presets.map(preset => preset.id))
  const pick = (team: TeamKey) => {
    const value = saved[team]
    return typeof value === 'string' && ids.has(value) ? value : DEFAULT_SELECTION[team]
  }

  const selection = { A: pick('A'), B: pick('B') }
  if (selection.A === selection.B) {
    selection.B = selection.A === 'default-a' ? 'default-b' : 'default-a'
  }
  return selection
}

/** Formato antigo: só os nomes dos times em `bt-team-names`. */
function migrateLegacyTeamNames(storage: Storage): TeamsData | null {
  const legacy = asObject(read(storage, STORAGE_KEYS.legacyTeamNames))
  if (!legacy || typeof legacy.A !== 'string' || typeof legacy.B !== 'string') return null

  const presets = DEFAULT_PRESETS.map(preset => ({ ...preset }))
  const selection = { ...DEFAULT_SELECTION }
  const stamp = Date.now()

  const legacyNames: [TeamKey, string, number][] = [
    ['A', legacy.A.trim(), 2],
    ['B', legacy.B.trim(), 3]
  ]
  for (const [team, name, paletteIndex] of legacyNames) {
    if (!name || name === `Time ${team}`) continue
    const id = `team-${stamp}-${team.toLowerCase()}`
    presets.push({ id, name, locked: false, colors: paletteColors(paletteIndex) })
    selection[team] = id
  }

  storage.removeItem(STORAGE_KEYS.legacyTeamNames)
  return { presets: ensureUniqueColors(presets), selection }
}

export function loadTeams(storage: Storage = localStorage): TeamsData {
  const saved = asObject(read(storage, STORAGE_KEYS.teams))

  if (saved && Array.isArray(saved.presets)) {
    const parsed = saved.presets
      .map(parsePreset)
      .filter((preset): preset is TeamPreset => preset !== null)
    const presets = ensureUniqueColors(withDefaultPresets(parsed))
    return { presets, selection: validSelection(saved.selection, presets) }
  }

  return (
    migrateLegacyTeamNames(storage) ?? {
      presets: DEFAULT_PRESETS.map(preset => ({ ...preset })),
      selection: { ...DEFAULT_SELECTION }
    }
  )
}

// ---------- Histórico ----------

function parseMatch(raw: unknown): MatchRecord | null {
  const match = asObject(raw)
  if (!match) return null

  return {
    teamA: typeof match.teamA === 'string' ? match.teamA : 'Time A',
    teamB: typeof match.teamB === 'string' ? match.teamB : 'Time B',
    teamAColors: normalizeTeamColors(match.teamAColors, paletteColors(0)),
    teamBColors: normalizeTeamColors(match.teamBColors, paletteColors(1)),
    gamesA: num(match.gamesA, match.setsA) ?? 0,
    gamesB: num(match.gamesB, match.setsB) ?? 0,
    winner: match.winner === 'B' ? 'B' : 'A',
    date: typeof match.date === 'string' ? match.date : new Date().toISOString()
  }
}

export function loadHistory(storage: Storage = localStorage): MatchRecord[] {
  const saved = read(storage, STORAGE_KEYS.history)
  if (!Array.isArray(saved)) return []
  return saved.map(parseMatch).filter((match): match is MatchRecord => match !== null)
}
