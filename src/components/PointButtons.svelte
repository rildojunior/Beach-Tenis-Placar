<script lang="ts">
  import { getContrastColor } from '../lib/palettes'
  import type { TeamKey } from '../lib/types'
  import { match } from '../stores/match.svelte'
  import { teams } from '../stores/teams.svelte'

  let { team }: { team: TeamKey } = $props()

  const color = $derived(teams.colors[team].primary)
</script>

<div class="flex flex-col gap-3">
  <button
    onclick={() => match.addPoint(team)}
    class="point-action"
    style:background-color={color}
    style:color={getContrastColor(color)}
    style:box-shadow="0 10px 28px {color}44"
    aria-label="Ponto para {teams.names[team]}"
  >
    <span class="material-symbols-outlined text-5xl font-bold">add</span>
  </button>
  <button
    onclick={() => match.removePoint(team)}
    class="subtle-action"
    aria-label="Remover ponto de {teams.names[team]}"
  >
    <span class="material-symbols-outlined">remove</span>
  </button>
</div>
