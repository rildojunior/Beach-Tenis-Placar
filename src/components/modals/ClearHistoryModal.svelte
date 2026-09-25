<script lang="ts">
  import { history } from '../../stores/history.svelte'
  import { ui } from '../../stores/ui.svelte'
  import Modal from '../ui/Modal.svelte'

  function confirm() {
    history.clear()
    ui.close('clearHistory')
  }
</script>

<Modal id="clearHistory" title="Limpar Histórico" class="p-5">
  <p class="text-center text-sm opacity-70">
    Tem certeza que deseja apagar todas as partidas salvas?
    <br />
    Esta ação não pode ser desfeita.
  </p>

  <div class="flex gap-3 pt-2">
    <button
      onclick={() => ui.close('clearHistory')}
      class="inline-modal-btn inline-modal-btn--ghost"
    >
      Cancelar
    </button>
    <button onclick={confirm} class="inline-modal-btn inline-modal-btn--danger"
      >Limpar</button
    >
  </div>
</Modal>
