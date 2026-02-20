const FALLBACK_COLORS = { primary: '#00C2FF' }

export const TEAM_COLOR_PALETTES = [
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

export function getPaletteById(paletteId) {
  return TEAM_COLOR_PALETTES.find(palette => palette.id === paletteId) || null
}

function normalizeHex(value) {
  if (typeof value !== 'string') return null
  const color = value.trim().toUpperCase()
  if (!/^#[0-9A-F]{6}$/.test(color)) return null
  return color
}

export function normalizeTeamColors(rawColors, fallback = FALLBACK_COLORS) {
  const palette = getPaletteById(rawColors?.paletteId || rawColors?.id)
  if (palette) {
    return {
      paletteId: palette.id,
      primary: palette.primary
    }
  }

  const primary = normalizeHex(rawColors?.primary) || fallback.primary

  return { paletteId: null, primary }
}

export function getPaletteFallbackByIndex(index = 0) {
  const palette = TEAM_COLOR_PALETTES[index] || TEAM_COLOR_PALETTES[0]
  return {
    paletteId: palette.id,
    primary: palette.primary
  }
}

export function getContrastColor(hexColor) {
  const normalized = normalizeHex(hexColor) || '#FFFFFF'
  const r = Number.parseInt(normalized.slice(1, 3), 16)
  const g = Number.parseInt(normalized.slice(3, 5), 16)
  const b = Number.parseInt(normalized.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.64 ? '#111418' : '#F5F7FA'
}
