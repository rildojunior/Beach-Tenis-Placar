import type { TeamColors } from './types'

export interface Palette {
  id: string
  label: string
  primary: string
}

export const TEAM_COLOR_PALETTES: readonly Palette[] = [
  { id: 'cyan', label: 'Cyan', primary: '#00C2FF' },
  { id: 'orange', label: 'Orange', primary: '#FF7A00' },
  { id: 'lime', label: 'Lime', primary: '#9DFF00' },
  { id: 'magenta', label: 'Magenta', primary: '#FF00A8' },
  { id: 'royal-blue', label: 'Royal Blue', primary: '#2155FF' },
  { id: 'gold', label: 'Gold', primary: '#FFC107' },
  { id: 'emerald', label: 'Emerald', primary: '#00C853' },
  { id: 'purple', label: 'Purple', primary: '#7C2DFF' },
  { id: 'red', label: 'Red', primary: '#FF2D2D' },
  { id: 'sky', label: 'Sky', primary: '#00A3FF' },
  { id: 'yellow', label: 'Yellow', primary: '#FFE600' },
  { id: 'pink', label: 'Pink', primary: '#FF4FA3' },
  { id: 'teal', label: 'Teal', primary: '#00D1B2' },
  { id: 'violet', label: 'Violet', primary: '#9B5CFF' },
  { id: 'scarlet', label: 'Scarlet', primary: '#E53935' },
  { id: 'indigo', label: 'Indigo', primary: '#3F51B5' },
  { id: 'green', label: 'Green', primary: '#43A047' },
  { id: 'amber', label: 'Amber', primary: '#FFB300' }
]

export function getPaletteById(paletteId: string | null | undefined): Palette | null {
  return TEAM_COLOR_PALETTES.find(palette => palette.id === paletteId) ?? null
}

export function paletteColors(index = 0): TeamColors {
  const palette = TEAM_COLOR_PALETTES[index] ?? TEAM_COLOR_PALETTES[0]
  return { paletteId: palette.id, primary: palette.primary }
}

/** Cor padrão de um time: A = cyan, B = laranja, demais = lime. */
export function defaultColorsFor(presetId: string): TeamColors {
  if (presetId === 'default-a') return paletteColors(0)
  if (presetId === 'default-b') return paletteColors(1)
  return paletteColors(2)
}

function normalizeHex(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const color = value.trim().toUpperCase()
  return /^#[0-9A-F]{6}$/.test(color) ? color : null
}

/** Aceita qualquer valor salvo e devolve cores válidas. */
export function normalizeTeamColors(
  raw: unknown,
  fallback: TeamColors = paletteColors(0)
): TeamColors {
  const value = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const palette = getPaletteById((value.paletteId ?? value.id) as string | undefined)
  if (palette) return { paletteId: palette.id, primary: palette.primary }

  return { paletteId: null, primary: normalizeHex(value.primary) ?? fallback.primary }
}

export function firstFreePaletteId(used: ReadonlySet<string>): string | null {
  return TEAM_COLOR_PALETTES.find(palette => !used.has(palette.id))?.id ?? null
}

/** Cor de texto legível (escura ou clara) sobre o fundo informado. */
export function getContrastColor(hexColor: string): string {
  const normalized = normalizeHex(hexColor) ?? '#FFFFFF'
  const r = Number.parseInt(normalized.slice(1, 3), 16)
  const g = Number.parseInt(normalized.slice(3, 5), 16)
  const b = Number.parseInt(normalized.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.64 ? '#111418' : '#F5F7FA'
}
