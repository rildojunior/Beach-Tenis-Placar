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

/** Modais em formato de alerta (centralizados). Os demais abrem como folha. */
const ALERTS: readonly ModalId[] = ['winner', 'tie', 'clearHistory']

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
  /** Há alguma folha aberta? A tela principal recua enquanto isso. */
  readonly sheetOpen = $derived(this.stack.some(id => !ALERTS.includes(id)))

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

  /** Esc fecha só o modal do topo. */
  handleEscape(event: KeyboardEvent, id: ModalId, onclose: () => void) {
    if (event.key !== 'Escape' || this.top !== id || event.defaultPrevented) return
    event.preventDefault()
    onclose()
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
