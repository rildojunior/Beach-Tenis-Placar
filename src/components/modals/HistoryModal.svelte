<script lang="ts">
  import { formatDate, shareHistoryImage } from '../../lib/share-history'
  import { history } from '../../stores/history.svelte'
  import { ui } from '../../stores/ui.svelte'
  import Sheet from '../ui/Sheet.svelte'

  let sharing = $state(false)
  const empty = $derived(history.matches.length === 0)

  async function share() {
    sharing = true
    try {
      await shareHistoryImage($state.snapshot(history.matches))
    } finally {
      sharing = false
    }
  }
</script>

<Sheet id="history" title="Histórico" closeLabel="Fechar histórico">
  {#if empty}
    <div class="flex flex-col items-center gap-2 py-12 text-center">
      <span class="material-symbols-outlined text-[3rem]! text-label-3"
        >sports_tennis</span
      >
      <p class="font-semibold">Nenhuma partida ainda</p>
      <p class="max-w-64 text-[0.9375rem] text-label-2">
        Os sets finalizados aparecem aqui, com o placar e a data.
      </p>
    </div>
  {:else}
    <div class="grid grid-cols-2 gap-3">
      <button onclick={share} class="btn-tinted" disabled={sharing}>
        <span class="material-symbols-outlined text-[1.25rem]!">ios_share</span>
        {sharing ? 'Gerando…' : 'Compartilhar'}
      </button>
      <button onclick={() => ui.open('clearHistory')} class="btn-plain-destructive">
        <span class="material-symbols-outlined text-[1.25rem]!">delete</span>
        Limpar
      </button>
    </div>

    <section>
      <h3 class="section-label">
        {history.matches.length}
        {history.matches.length === 1 ? 'partida' : 'partidas'}
      </h3>
      <div class="group">
        {#each history.matches as item}
          {@const winnerColors =
            item.winner === 'A' ? item.teamAColors : item.teamBColors}
          <div class="row items-start">
            <span
              class="material-symbols-outlined mt-0.5 text-[1.25rem]!"
              style:color={winnerColors.primary}
              style:font-variation-settings="'FILL' 1"
              aria-hidden="true">trophy</span
            >
            <div class="min-w-0 flex-1">
              <p class="truncate font-semibold" style:color={winnerColors.primary}>
                {item.winner === 'A' ? item.teamA : item.teamB}
              </p>
              <p class="truncate text-[0.8125rem] text-label-2">
                <span style:color={item.teamAColors.primary}>{item.teamA}</span>
                ×
                <span style:color={item.teamBColors.primary}>{item.teamB}</span>
              </p>
              <p class="text-xs text-label-3">{formatDate(item.date)}</p>
            </div>
            <span class="display-number shrink-0 text-[1.375rem] font-semibold">
              {item.gamesA}–{item.gamesB}
            </span>
          </div>
        {/each}
      </div>
    </section>
  {/if}
</Sheet>
