import { haptics } from '../lib/haptics'
import * as rules from '../lib/scoring'
import { loadScore } from '../lib/storage'
import type { Score, TeamKey } from '../lib/types'
import { history } from './history.svelte'
import { settings } from './settings.svelte'
import { teams } from './teams.svelte'
import { ui } from './ui.svelte'

class MatchStore {
  score: Score = $state(loadScore())
  /** Direção da última mudança no placar, usada para animar os números. */
  lastDelta: 1 | -1 = $state(1)

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
    const gamesBefore = this.games(team)
    this.lastDelta = 1
    this.score = rules.addPoint(this.score, team)
    if (!this.checkSetEnd() && this.games(team) > gamesBefore) haptics.game()
  }

  removePoint(team: TeamKey) {
    this.lastDelta = -1
    this.score = rules.removePoint(this.score, team)
  }

  setGames(team: TeamKey, games: number) {
    this.lastDelta = games >= this.games(team) ? 1 : -1
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
    this.lastDelta = -1
    this.score = { ...rules.EMPTY_SCORE }
  }

  /** Mostra o vencedor se o set acabou. Retorna se acabou. */
  private checkSetEnd(): boolean {
    const winner = rules.setWinner(this.score, settings)
    if (!winner) return false
    haptics.set()
    ui.showWinner(winner)
    return true
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
