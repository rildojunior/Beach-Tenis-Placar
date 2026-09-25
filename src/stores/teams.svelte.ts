import {
  defaultColorsFor,
  firstFreePaletteId,
  getPaletteById,
  normalizeTeamColors
} from '../lib/palettes'
import { loadTeams } from '../lib/storage'
import {
  otherTeam,
  type TeamColors,
  type TeamKey,
  type TeamPreset,
  type TeamSelection
} from '../lib/types'

export const presetColors = (preset: TeamPreset): TeamColors =>
  normalizeTeamColors(preset.colors, defaultColorsFor(preset.id))

class TeamsStore {
  presets: TeamPreset[] = $state([])
  selection: TeamSelection = $state({ A: 'default-a', B: 'default-b' })

  /** Mais recentes primeiro. */
  readonly presetsForDisplay = $derived([...this.presets].reverse())

  readonly selected = $derived({
    A: this.byId(this.selection.A),
    B: this.byId(this.selection.B)
  })

  readonly names = $derived({
    A: this.selected.A?.name || 'Time A',
    B: this.selected.B?.name || 'Time B'
  })

  readonly colors: Record<TeamKey, TeamColors> = $derived({
    A: this.selected.A ? presetColors(this.selected.A) : defaultColorsFor('default-a'),
    B: this.selected.B ? presetColors(this.selected.B) : defaultColorsFor('default-b')
  })

  constructor() {
    const data = loadTeams()
    this.presets = data.presets
    this.selection = data.selection
  }

  byId(id: string): TeamPreset | undefined {
    return this.presets.find(preset => preset.id === id)
  }

  usedPaletteIds(exceptPresetId?: string): Set<string> {
    return new Set(
      this.presets
        .filter(preset => preset.id !== exceptPresetId)
        .map(preset => presetColors(preset).paletteId)
        .filter((id): id is string => id !== null)
    )
  }

  firstAvailablePaletteId(): string | null {
    return firstFreePaletteId(this.usedPaletteIds())
  }

  /** Cadastra um time. Retorna uma mensagem de erro ou `null` em caso de sucesso. */
  add(rawName: string, paletteId: string | null): string | null {
    const name = rawName.trim()
    if (!name) return 'Digite o nome do time.'

    const exists = this.presets.some(
      preset => preset.name.toLowerCase() === name.toLowerCase()
    )
    if (exists) return 'Já existe um time com esse nome.'

    if (!paletteId || this.usedPaletteIds().has(paletteId)) {
      return 'Todas as cores disponíveis já estão em uso. Exclua um time ou troque uma cor antes de criar outro.'
    }

    this.presets.push({
      id: `team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      locked: false,
      colors: normalizeTeamColors({ paletteId })
    })
    return null
  }

  remove(presetId: string) {
    const preset = this.byId(presetId)
    if (!preset || preset.locked) return

    this.presets = this.presets.filter(item => item.id !== presetId)

    for (const team of ['A', 'B'] as const) {
      if (this.selection[team] !== presetId) continue
      const taken = this.selection[otherTeam(team)]
      this.selection[team] =
        this.presets.find(item => item.id !== taken)?.id ??
        (taken === 'default-a' ? 'default-b' : 'default-a')
    }
  }

  setPalette(presetId: string, paletteId: string) {
    const preset = this.byId(presetId)
    if (!preset || !getPaletteById(paletteId)) return
    if (this.usedPaletteIds(presetId).has(paletteId)) return
    preset.colors = normalizeTeamColors({ paletteId })
  }

  /** Um mesmo time não pode jogar dos dois lados. */
  select(team: TeamKey, presetId: string): boolean {
    if (this.selection[otherTeam(team)] === presetId || !this.byId(presetId)) return false
    this.selection[team] = presetId
    return true
  }
}

export const teams = new TeamsStore()
