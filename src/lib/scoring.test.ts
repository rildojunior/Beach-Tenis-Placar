import { describe, expect, it } from 'vitest'
import {
  addPoint,
  EMPTY_SCORE,
  finishOutcome,
  formatPoints,
  historyWinner,
  maxEditableGames,
  parseGamesInput,
  removePoint,
  sanitizeGamesToWin,
  setWinner
} from './scoring'
import type { Settings } from './types'

const withGames = (gamesToWin: number): Settings => ({
  scoringMode: 'official',
  gamesEnabled: true,
  gamesToWin
})

describe('formatPoints', () => {
  it('usa 0/15/30/40 no modo oficial', () => {
    expect([0, 1, 2, 3].map(p => formatPoints(p, 'official'))).toEqual([
      '0',
      '15',
      '30',
      '40'
    ])
  })

  it('usa números no modo simplificado', () => {
    expect(formatPoints(2, 'simplified')).toBe('2')
  })
})

describe('addPoint / removePoint', () => {
  it('fecha o game no 4º ponto e zera os pontos dos dois times', () => {
    let score = { ...EMPTY_SCORE, pointsB: 2 }
    for (let i = 0; i < 4; i++) score = addPoint(score, 'A')
    expect(score).toEqual({ pointsA: 0, pointsB: 0, gamesA: 1, gamesB: 0 })
  })

  it('não deixa pontos negativos', () => {
    expect(removePoint(EMPTY_SCORE, 'B').pointsB).toBe(0)
  })

  it('não altera o placar original', () => {
    const score = { ...EMPTY_SCORE }
    addPoint(score, 'A')
    expect(score).toEqual(EMPTY_SCORE)
  })
})

describe('setWinner', () => {
  it('ignora o limite quando desativado', () => {
    const settings = { ...withGames(3), gamesEnabled: false }
    expect(setWinner({ ...EMPTY_SCORE, gamesA: 5 }, settings)).toBeNull()
  })

  it('aponta o vencedor ao atingir o limite', () => {
    expect(setWinner({ ...EMPTY_SCORE, gamesA: 1, gamesB: 3 }, withGames(3))).toBe('B')
  })

  it('também encerra se o limite foi reduzido abaixo do placar atual', () => {
    expect(setWinner({ ...EMPTY_SCORE, gamesA: 4, gamesB: 1 }, withGames(3))).toBe('A')
  })
})

describe('finishOutcome', () => {
  it('descarta set sem games', () => {
    expect(finishOutcome({ ...EMPTY_SCORE, pointsA: 2 })).toEqual({ kind: 'discard' })
  })

  it('bloqueia empate', () => {
    expect(finishOutcome({ ...EMPTY_SCORE, gamesA: 2, gamesB: 2 })).toEqual({
      kind: 'tie'
    })
  })

  it('aponta quem tem mais games', () => {
    expect(finishOutcome({ ...EMPTY_SCORE, gamesA: 1, gamesB: 2 })).toEqual({
      kind: 'winner',
      team: 'B'
    })
  })
})

describe('historyWinner', () => {
  it('não registra partida zerada', () => {
    expect(historyWinner(EMPTY_SCORE)).toBeNull()
  })

  it('desempata pelos pontos quando os games empatam', () => {
    expect(historyWinner({ pointsA: 1, pointsB: 3, gamesA: 2, gamesB: 2 })).toBe('B')
  })
})

describe('edição manual de games', () => {
  it('limita ao valor abaixo do necessário para vencer', () => {
    expect(maxEditableGames(withGames(3))).toBe(2)
    expect(maxEditableGames({ ...withGames(3), gamesEnabled: false })).toBe(99)
  })

  it('aceita só inteiros dentro do limite', () => {
    expect(parseGamesInput(' 2 ', 2)).toBe(2)
    expect(parseGamesInput('3', 2)).toBeNull()
    expect(parseGamesInput('1.5', 2)).toBeNull()
    expect(parseGamesInput('', 2)).toBeNull()
  })
})

describe('sanitizeGamesToWin', () => {
  it('arredonda para baixo e exige no mínimo 1', () => {
    expect(sanitizeGamesToWin(2.7)).toBe(2)
    expect(sanitizeGamesToWin(0)).toBe(1)
    expect(sanitizeGamesToWin(null)).toBe(1)
  })
})
