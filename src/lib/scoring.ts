import type { ScoringMode, Score, Settings, TeamKey } from './types'

/** No beach tennis não há vantagem: o 4º ponto fecha o game. */
export const POINTS_PER_GAME = 4

const OFFICIAL_LABELS = ['0', '15', '30', '40']

export const EMPTY_SCORE: Score = { pointsA: 0, pointsB: 0, gamesA: 0, gamesB: 0 }

export function formatPoints(points: number, mode: ScoringMode): string {
  if (mode === 'official') return OFFICIAL_LABELS[points] ?? '40'
  return String(points)
}

export function addPoint(score: Score, team: TeamKey): Score {
  const pointsKey = team === 'A' ? 'pointsA' : 'pointsB'
  const gamesKey = team === 'A' ? 'gamesA' : 'gamesB'
  const next = { ...score, [pointsKey]: score[pointsKey] + 1 }

  if (next[pointsKey] < POINTS_PER_GAME) return next
  return { ...next, [gamesKey]: next[gamesKey] + 1, pointsA: 0, pointsB: 0 }
}

export function removePoint(score: Score, team: TeamKey): Score {
  const pointsKey = team === 'A' ? 'pointsA' : 'pointsB'
  return { ...score, [pointsKey]: Math.max(0, score[pointsKey] - 1) }
}

/** Vencedor do set quando o limite de games está ativo e foi atingido. */
export function setWinner(score: Score, settings: Settings): TeamKey | null {
  if (!settings.gamesEnabled) return null
  const { gamesA, gamesB } = score
  if (Math.max(gamesA, gamesB) < settings.gamesToWin || gamesA === gamesB) return null
  return gamesA > gamesB ? 'A' : 'B'
}

export type FinishOutcome =
  { kind: 'discard' } | { kind: 'tie' } | { kind: 'winner'; team: TeamKey }

/** O que acontece ao tocar em "Finalizar Set". */
export function finishOutcome(score: Score): FinishOutcome {
  const { gamesA, gamesB } = score
  if (gamesA === 0 && gamesB === 0) return { kind: 'discard' }
  if (gamesA === gamesB) return { kind: 'tie' }
  return { kind: 'winner', team: gamesA > gamesB ? 'A' : 'B' }
}

/** Vencedor usado no histórico. Games decidem; empate em games vai para os pontos. */
export function historyWinner(score: Score): TeamKey | null {
  const { pointsA, pointsB, gamesA, gamesB } = score
  if (gamesA === 0 && gamesB === 0 && pointsA === 0 && pointsB === 0) return null
  if (gamesB > gamesA) return 'B'
  if (gamesA === gamesB && pointsB > pointsA) return 'B'
  return 'A'
}

/** Maior valor aceito ao editar games manualmente. */
export function maxEditableGames(settings: Settings): number {
  return settings.gamesEnabled ? Math.max(0, settings.gamesToWin - 1) : 99
}

export function parseGamesInput(raw: string, max: number): number | null {
  const trimmed = raw.trim()
  if (trimmed === '') return null
  const parsed = Number(trimmed)
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > max) return null
  return parsed
}

/** Garante um número inteiro de games para vencer, no mínimo 1. */
export function sanitizeGamesToWin(value: unknown): number {
  const parsed = Math.floor(Number(value))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}
