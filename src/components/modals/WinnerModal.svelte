<script lang="ts">
  import { match } from '../../stores/match.svelte'
  import { teams } from '../../stores/teams.svelte'
  import { ui } from '../../stores/ui.svelte'
  import Modal from '../ui/Modal.svelte'

  function newMatch() {
    match.reset({ saveToHistory: true })
    ui.close('winner')
  }
</script>

<Modal id="winner">
  <h2 class="text-center text-xl font-black">🏆 FIM DO SET 🏆</h2>

  {#if ui.winner}
    <p class="text-center text-lg font-bold">
      <span style:color={teams.colors[ui.winner].primary}>{teams.names[ui.winner]}</span>
      venceu o set
    </p>
  {/if}

  <button onclick={newMatch} class="modal-primary-btn">Nova Partida</button>
</Modal>
