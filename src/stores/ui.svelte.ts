import type { TeamKey } from '../lib/types'

export type ModalId =
  | 'settings'
  | 'teamsManager'
  | 'teamPicker'
  | 'palettePicker'
  | 'winner'
  | 'tie'
  | 'history'
  | 'clearHistory'

export interface PalettePickerRequest {
  selectedId: string | null
  onPick: (paletteId: string) => void
}

class UiStore {
  /** Modais abertos, do mais antigo para o do topo. */
  stack: ModalId[] = $state([])

  /** Qual lado da quadra está escolhendo time. */
  pickingTeam: TeamKey | null = $state(null)
  winner: TeamKey | null = $state(null)
  palettePicker: PalettePickerRequest | null = $state(null)

  readonly anyOpen = $derived(this.stack.length > 0)
  readonly top = $derived(this.stack.at(-1))

  isOpen(id: ModalId) {
    return this.stack.includes(id)
  }

  level(id: ModalId) {
    return this.stack.indexOf(id)
  }

  open(id: ModalId) {
    if (!this.isOpen(id)) this.stack.push(id)
  }

  close(id: ModalId) {
    this.stack = this.stack.filter(item => item !== id)
  }

  openTeamPicker(team: TeamKey) {
    this.pickingTeam = team
    this.open('teamPicker')
  }

  showWinner(team: TeamKey) {
    this.winner = team
    this.open('winner')
  }

  pickPalette(request: PalettePickerRequest) {
    this.palettePicker = request
    this.open('palettePicker')
  }
}

export const ui = new UiStore()
