<script lang="ts">
  import { ui } from '../../stores/ui.svelte'
  import Modal from '../ui/Modal.svelte'
</script>

<Modal id="tie" title="Partida Empatada">
  <p class="text-center text-sm leading-relaxed opacity-70">
    A partida está empatada em games.
    <br />
    É necessário realizar o desempate antes de finalizar.
  </p>

  <button
    onclick={() => ui.close('tie')}
    class="modal-primary-btn tracking-widest uppercase transition-transform active:scale-95"
  >
    Continuar Partida
  </button>
</Modal>
