<script lang="ts">
  import { formatDate, shareHistoryImage } from '../../lib/share-history'
  import { history } from '../../stores/history.svelte'
  import { ui } from '../../stores/ui.svelte'
  import Modal from '../ui/Modal.svelte'

  let sharing = $state(false)

  async function share() {
    sharing = true
    try {
      await shareHistoryImage($state.snapshot(history.matches))
    } finally {
      sharing = false
    }
  }
</script>

<Modal
  id="history"
  title="Histórico de Partidas"
  closeLabel="Fechar histórico"
  class="p-5"
>
  <button
    onclick={() => ui.open('clearHistory')}
    class="modal-secondary-btn"
    disabled={history.matches.length === 0}
  >
    Limpar histórico
  </button>

  <button
    onclick={share}
    class="modal-share-btn"
    disabled={history.matches.length === 0 || sharing}
  >
    {sharing ? 'Gerando imagem…' : 'Compartilhar histórico'}
  </button>

  <div class="max-h-[60vh] space-y-3 overflow-y-auto">
    {#each history.matches as item}
      {@const winnerColors = item.winner === 'A' ? item.teamAColors : item.teamBColors}
      <div class="space-y-1 rounded-xl bg-white/5 p-3">
        <div class="flex justify-between gap-3 text-sm font-bold">
          <span style:color={winnerColors.primary}>
            🏆 {item.winner === 'A' ? item.teamA : item.teamB}
          </span>
          <span class="shrink-0 opacity-60">{item.gamesA} x {item.gamesB}</span>
        </div>
        <div class="flex items-center gap-2 text-xs opacity-70">
          <span style:color={item.teamAColors.primary}>{item.teamA}</span>
          <span class="opacity-40">x</span>
          <span style:color={item.teamBColors.primary}>{item.teamB}</span>
        </div>
        <div class="text-[10px] opacity-40">{formatDate(item.date)}</div>
      </div>
    {:else}
      <p class="text-center text-sm opacity-50">Nenhuma partida registrada</p>
    {/each}
  </div>
</Modal>
