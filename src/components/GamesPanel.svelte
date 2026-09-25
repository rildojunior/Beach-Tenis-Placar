<!-- Placar de games. Tocar no número permite corrigir o valor. -->
<script lang="ts">
  import { maxEditableGames, parseGamesInput } from '../lib/scoring'
  import type { TeamKey } from '../lib/types'
  import { match } from '../stores/match.svelte'
  import { settings } from '../stores/settings.svelte'
  import { teams } from '../stores/teams.svelte'
  import RollingNumber from './ui/RollingNumber.svelte'
  import TeamName from './ui/TeamName.svelte'

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

<section>
  <h2 class="section-label">
    Games{settings.gamesEnabled ? ` · set de ${settings.gamesToWin}` : ''}
  </h2>
  <div
    class="card grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-x-2 px-3 py-4"
  >
    {#each ['A', 'B'] as const as team, index (team)}
      {#if index === 1}
        <span class="h-10 w-px self-center bg-separator" aria-hidden="true"></span>
      {/if}
      <button
        type="button"
        onclick={() => editGames(team)}
        class="flex min-w-0 flex-col items-center gap-1"
        aria-label="Editar games de {teams.names[team]}: {match.games(team)}"
      >
        <span class="display-number text-[2.75rem] font-bold">
          <RollingNumber value={match.games(team)} />
        </span>
        <span
          class="text-xs leading-tight font-medium"
          style:color={teams.colors[team].primary}
        >
          <TeamName name={teams.names[team]} />
        </span>
      </button>
    {/each}
  </div>
</section>
