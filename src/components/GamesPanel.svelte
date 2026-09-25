<!-- Placar de games. Tocar no número permite corrigir o valor. -->
<script lang="ts">
  import { maxEditableGames, parseGamesInput } from '../lib/scoring'
  import type { TeamKey } from '../lib/types'
  import { match } from '../stores/match.svelte'
  import { settings } from '../stores/settings.svelte'
  import { teams } from '../stores/teams.svelte'

  function editGames(team: TeamKey) {
    const max = maxEditableGames(settings)
    const hint = settings.gamesEnabled
      ? `0 a ${max} (deve ser menor que ${settings.gamesToWin})`
      : `0 a ${max}`

    const raw = window.prompt(
      `Digite o novo valor de games para ${teams.names[team]} (${hint}).`,
      String(match.games(team))
    )
    if (raw === null) return

    const games = parseGamesInput(raw, max)
    if (games === null) {
      window.alert(`Valor inválido para games. Use um número inteiro entre 0 e ${max}.`)
      return
    }
    match.setGames(team, games)
  }
</script>

<section class="px-6 py-4">
  <div class="games-panel">
    <h3 class="mb-3 text-xs font-bold tracking-[0.3em] text-primary uppercase">
      Pontuação dos Games
    </h3>

    <div class="flex items-center justify-center gap-8">
      {#each ['A', 'B'] as const as team, index (team)}
        {#if index === 1}
          <div class="h-10 w-px rounded-full bg-white/10"></div>
        {/if}
        <div class="text-center">
          <button
            type="button"
            onclick={() => editGames(team)}
            class="text-4xl font-black"
            title="Editar games de {teams.names[team]}"
          >
            {match.games(team)}
          </button>
          <span
            class="mx-auto block max-w-[110px] text-[10px] leading-tight break-words whitespace-normal uppercase opacity-50"
            style:color={teams.colors[team].primary}
          >
            {teams.names[team]}
          </span>
        </div>
      {/each}
    </div>
  </div>
</section>
