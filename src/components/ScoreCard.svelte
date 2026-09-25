<script lang="ts">
  import { POINTS_PER_GAME } from '../lib/scoring'
  import { otherTeam, type TeamKey } from '../lib/types'
  import { match } from '../stores/match.svelte'
  import { teams } from '../stores/teams.svelte'
  import { ui } from '../stores/ui.svelte'

  let { team }: { team: TeamKey } = $props()

  const color = $derived(teams.colors[team].primary)
  const points = $derived(match.points(team))
  const leading = $derived(points > match.points(otherTeam(team)))
</script>

<div
  class="score-card"
  class:leading
  style:border-color={color}
  style:--leading-glow="{color}55"
>
  <button
    type="button"
    onclick={() => ui.openTeamPicker(team)}
    class="team-name-label"
    style:color
    aria-label="Trocar {teams.names[team]}"
  >
    {teams.names[team]}
  </button>

  <div class="flex flex-1 items-center justify-center">
    <span class="text-7xl font-black">{match.display[team]}</span>
  </div>

  <div class="mt-2 flex gap-1" aria-hidden="true">
    {#each { length: POINTS_PER_GAME }, index}
      {@const active = index < points}
      <div
        class="progress-dot"
        class:active
        style:background-color={active ? color : null}
      ></div>
    {/each}
  </div>
</div>
