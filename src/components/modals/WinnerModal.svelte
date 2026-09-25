<script lang="ts">
  import { match } from '../../stores/match.svelte'
  import { teams } from '../../stores/teams.svelte'
  import { ui } from '../../stores/ui.svelte'
  import Alert from '../ui/Alert.svelte'

  const winner = $derived(ui.winner ?? 'A')

  function newMatch() {
    match.reset({ saveToHistory: true })
    ui.close('winner')
  }
</script>

<Alert id="winner" title="{teams.names[winner]} venceu o set">
  {#snippet icon()}
    <span
      class="material-symbols-outlined mb-1 text-[2.75rem]!"
      style:color={teams.colors[winner].primary}
      style:font-variation-settings="'FILL' 1"
    >
      trophy
    </span>
  {/snippet}

  <p class="alert-message">
    Placar final:
    <span class="display-number font-semibold text-white">
      {match.score.gamesA} × {match.score.gamesB}
    </span>
  </p>

  {#snippet actions()}
    <button onclick={newMatch} class="font-semibold">Nova partida</button>
    <button onclick={() => ui.close('winner')}>Voltar ao placar</button>
  {/snippet}
</Alert>
