<script lang="ts">
  import { getContrastColor } from '../lib/palettes'
  import type { TeamKey } from '../lib/types'
  import { match } from '../stores/match.svelte'
  import { teams } from '../stores/teams.svelte'

  let { team }: { team: TeamKey } = $props()

  const color = $derived(teams.colors[team].primary)
</script>

<div
  class="flex flex-col gap-3"
  style:--team={color}
  style:--team-contrast={getContrastColor(color)}
>
  <button
    onclick={() => match.addPoint(team)}
    class="point-action"
    aria-label="Ponto para {teams.names[team]}"
  >
    <span
      class="material-symbols-outlined text-[3.5rem]!"
      style:font-variation-settings="'wght' 600"
    >
      add
    </span>
  </button>
  <button
    onclick={() => match.removePoint(team)}
    class="subtle-action"
    aria-label="Remover ponto de {teams.names[team]}"
    disabled={match.points(team) === 0}
  >
    <span class="material-symbols-outlined">remove</span>
  </button>
</div>
