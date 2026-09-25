export type TeamKey = 'A' | 'B'

export type ScoringMode = 'official' | 'simplified'

export interface Settings {
  scoringMode: ScoringMode
  /** Quando ativo, o set termina ao atingir `gamesToWin`. */
  gamesEnabled: boolean
  gamesToWin: number
}

export interface TeamColors {
  paletteId: string | null
  primary: string
}

export interface TeamPreset {
  id: string
  name: string
  /** Times padrão não podem ser excluídos. */
  locked: boolean
  colors: TeamColors
}

export type TeamSelection = Record<TeamKey, string>

export interface Score {
  pointsA: number
  pointsB: number
  gamesA: number
  gamesB: number
}

export interface MatchRecord {
  teamA: string
  teamB: string
  teamAColors: TeamColors
  teamBColors: TeamColors
  gamesA: number
  gamesB: number
  winner: TeamKey
  /** Data ISO 8601. */
  date: string
}

export const otherTeam = (team: TeamKey): TeamKey => (team === 'A' ? 'B' : 'A')
