<script lang="ts">
  import { history } from '../../stores/history.svelte'
  import { ui } from '../../stores/ui.svelte'
  import Alert from '../ui/Alert.svelte'

  function confirm() {
    history.clear()
    ui.close('clearHistory')
  }
</script>

<Alert id="clearHistory" title="Apagar o histórico?" row>
  <p class="alert-message">
    Todas as partidas salvas serão apagadas. Não é possível desfazer.
  </p>

  {#snippet actions()}
    <button onclick={() => ui.close('clearHistory')}>Cancelar</button>
    <button onclick={confirm} class="font-semibold text-destructive!">Apagar</button>
  {/snippet}
</Alert>
