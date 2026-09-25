import { beforeEach, describe, expect, it } from 'vitest'
import { loadHistory, loadScore, loadSettings, loadTeams, STORAGE_KEYS } from './storage'

class MemoryStorage implements Storage {
  private data = new Map<string, string>()
  get length() {
    return this.data.size
  }
  clear() {
    this.data.clear()
  }
  getItem(key: string) {
    return this.data.get(key) ?? null
  }
  key(index: number) {
    return [...this.data.keys()][index] ?? null
  }
  removeItem(key: string) {
    this.data.delete(key)
  }
  setItem(key: string, value: string) {
    this.data.set(key, value)
  }
}

let storage: MemoryStorage
const put = (key: string, value: unknown) => storage.setItem(key, JSON.stringify(value))

beforeEach(() => {
  storage = new MemoryStorage()
})

describe('loadSettings', () => {
  it('usa os padrões quando não há nada salvo', () => {
    expect(loadSettings(storage)).toEqual({
      scoringMode: 'official',
      gamesEnabled: false,
      gamesToWin: 3
    })
  })

  it('migra as chaves antigas setsEnabled/setsToWin', () => {
    put(STORAGE_KEYS.settings, {
      scoringMode: 'simplified',
      setsEnabled: true,
      setsToWin: 5
    })
    expect(loadSettings(storage)).toEqual({
      scoringMode: 'simplified',
      gamesEnabled: true,
      gamesToWin: 5
    })
  })

  it('ignora JSON corrompido', () => {
    storage.setItem(STORAGE_KEYS.settings, '{quebrado')
    expect(loadSettings(storage).gamesToWin).toBe(3)
  })
})

describe('loadScore', () => {
  it('migra setsA/setsB para gamesA/gamesB', () => {
    put(STORAGE_KEYS.score, { pointsA: 1, pointsB: 2, setsA: 3, setsB: 4 })
    expect(loadScore(storage)).toEqual({ pointsA: 1, pointsB: 2, gamesA: 3, gamesB: 4 })
  })
})

describe('loadTeams', () => {
  it('cria os dois times padrão na primeira execução', () => {
    const { presets, selection } = loadTeams(storage)
    expect(presets.map(p => p.id)).toEqual(['default-a', 'default-b'])
    expect(selection).toEqual({ A: 'default-a', B: 'default-b' })
  })

  it('mantém a cor escolhida para um time padrão', () => {
    put(STORAGE_KEYS.teams, {
      presets: [
        { id: 'default-a', name: 'Time A', colors: { paletteId: 'lime' } },
        { id: 'default-b', name: 'Time B', colors: { paletteId: 'orange' } }
      ],
      selection: { A: 'default-a', B: 'default-b' }
    })
    expect(loadTeams(storage).presets[0].colors.paletteId).toBe('lime')
  })

  it('troca cores repetidas pela próxima livre', () => {
    put(STORAGE_KEYS.teams, {
      presets: [
        { id: 'default-a', name: 'Time A', colors: { paletteId: 'cyan' } },
        { id: 'default-b', name: 'Time B', colors: { paletteId: 'orange' } },
        { id: 'team-1', name: 'Dupla', colors: { paletteId: 'cyan' } }
      ],
      selection: { A: 'team-1', B: 'default-b' }
    })
    const { presets, selection } = loadTeams(storage)
    const ids = presets.map(p => p.colors.paletteId)
    expect(new Set(ids).size).toBe(ids.length)
    expect(selection).toEqual({ A: 'team-1', B: 'default-b' })
  })

  it('não deixa o mesmo time nos dois lados', () => {
    put(STORAGE_KEYS.teams, {
      presets: [],
      selection: { A: 'default-b', B: 'default-b' }
    })
    expect(loadTeams(storage).selection).toEqual({ A: 'default-b', B: 'default-a' })
  })

  it('migra o formato antigo bt-team-names', () => {
    put(STORAGE_KEYS.legacyTeamNames, { A: 'Ana e Bia', B: 'Time B' })
    const { presets, selection } = loadTeams(storage)
    const custom = presets.find(p => p.id === selection.A)
    expect(custom?.name).toBe('Ana e Bia')
    expect(selection.B).toBe('default-b')
    expect(storage.getItem(STORAGE_KEYS.legacyTeamNames)).toBeNull()
  })
})

describe('loadHistory', () => {
  it('normaliza partidas antigas', () => {
    put(STORAGE_KEYS.history, [
      {
        teamA: 'X',
        teamB: 'Y',
        setsA: 3,
        setsB: 1,
        winner: 'A',
        date: '2025-01-01T00:00:00Z'
      },
      null
    ])
    const [match, ...rest] = loadHistory(storage)
    expect(rest).toHaveLength(0)
    expect(match).toMatchObject({ gamesA: 3, gamesB: 1, winner: 'A' })
    expect(match.teamAColors.primary).toBe('#00C2FF')
  })
})
