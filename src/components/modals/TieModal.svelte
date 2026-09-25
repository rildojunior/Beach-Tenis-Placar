<script lang="ts">
  import { ui } from '../../stores/ui.svelte'
  import Alert from '../ui/Alert.svelte'
</script>

<Alert id="tie" title="Set empatado">
  <p class="alert-message">
    Os dois times têm o mesmo número de games. Jogue o desempate antes de finalizar.
  </p>

  {#snippet actions()}
    <button onclick={() => ui.close('tie')} class="font-semibold"
      >Continuar partida</button
    >
  {/snippet}
</Alert>
