<script lang="ts">
  import { POINTS_PER_GAME } from '../lib/scoring'
  import { otherTeam, type TeamKey } from '../lib/types'
  import { match } from '../stores/match.svelte'
  import { teams } from '../stores/teams.svelte'
  import { ui } from '../stores/ui.svelte'
  import RollingNumber from './ui/RollingNumber.svelte'

  let { team }: { team: TeamKey } = $props()

  const points = $derived(match.points(team))
  const leading = $derived(points > match.points(otherTeam(team)))
</script>

<div class="score-card" class:leading style:--team={teams.colors[team].primary}>
  <button
    type="button"
    onclick={() => ui.openTeamPicker(team)}
    class="team-chip"
    aria-label="Trocar {teams.names[team]}"
  >
    <span class="truncate">{teams.names[team]}</span>
    <span class="material-symbols-outlined -mr-1 text-[1rem]!" aria-hidden="true"
      >expand_more</span
    >
  </button>

  <div class="flex flex-1 items-center justify-center py-2">
    <span class="display-number text-[5.5rem] font-bold" aria-live="polite">
      <RollingNumber value={match.display[team]} direction={match.lastDelta} />
    </span>
  </div>

  <div class="flex gap-1" aria-hidden="true">
    {#each { length: POINTS_PER_GAME }, index}
      <span class="progress-dot" class:active={index < points}></span>
    {/each}
  </div>
</div>
