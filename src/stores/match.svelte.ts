import * as rules from '../lib/scoring'
import { loadScore } from '../lib/storage'
import type { Score, TeamKey } from '../lib/types'
import { history } from './history.svelte'
import { settings } from './settings.svelte'
import { teams } from './teams.svelte'
import { ui } from './ui.svelte'

class MatchStore {
  score: Score = $state(loadScore())

  readonly display = $derived({
    A: rules.formatPoints(this.score.pointsA, settings.scoringMode),
    B: rules.formatPoints(this.score.pointsB, settings.scoringMode)
  })

  points(team: TeamKey) {
    return team === 'A' ? this.score.pointsA : this.score.pointsB
  }

  games(team: TeamKey) {
    return team === 'A' ? this.score.gamesA : this.score.gamesB
  }

  addPoint(team: TeamKey) {
    this.score = rules.addPoint(this.score, team)
    this.checkSetEnd()
  }

  removePoint(team: TeamKey) {
    this.score = rules.removePoint(this.score, team)
  }

  setGames(team: TeamKey, games: number) {
    this.score = { ...this.score, [team === 'A' ? 'gamesA' : 'gamesB']: games }
    this.checkSetEnd()
  }

  /** Botão "Finalizar Set". */
  finish() {
    const outcome = rules.finishOutcome(this.score)
    if (outcome.kind === 'discard') this.reset({ saveToHistory: false })
    else if (outcome.kind === 'tie') ui.open('tie')
    else ui.showWinner(outcome.team)
  }

  reset({ saveToHistory }: { saveToHistory: boolean }) {
    if (saveToHistory) this.saveToHistory()
    this.score = { ...rules.EMPTY_SCORE }
  }

  private checkSetEnd() {
    const winner = rules.setWinner(this.score, settings)
    if (winner) ui.showWinner(winner)
  }

  private saveToHistory() {
    const winner = rules.historyWinner(this.score)
    if (!winner) return

    history.add({
      teamA: teams.names.A,
      teamB: teams.names.B,
      teamAColors: { ...teams.colors.A },
      teamBColors: { ...teams.colors.B },
      gamesA: this.score.gamesA,
      gamesB: this.score.gamesB,
      winner,
      date: new Date().toISOString()
    })
  }
}

export const match = new MatchStore()
