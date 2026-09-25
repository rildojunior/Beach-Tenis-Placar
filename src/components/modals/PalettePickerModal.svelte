<script lang="ts">
  import { teams } from '../../stores/teams.svelte'
  import { ui } from '../../stores/ui.svelte'
  import Modal from '../ui/Modal.svelte'
  import PaletteOptions from '../ui/PaletteOptions.svelte'

  function close() {
    ui.close('palettePicker')
    ui.palettePicker = null
  }

  function pick(paletteId: string) {
    ui.palettePicker?.onPick(paletteId)
    close()
  }
</script>

<Modal
  id="palettePicker"
  title="Selecionar Cor do Time"
  closeLabel="Fechar seleção de cor"
  onclose={close}
>
  <div class="max-h-[50vh] overflow-y-auto pr-1">
    <PaletteOptions
      selectedId={ui.palettePicker?.selectedId ?? null}
      usedIds={teams.usedPaletteIds()}
      onpick={pick}
    />
  </div>
</Modal>
