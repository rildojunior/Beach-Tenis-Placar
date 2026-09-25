<script lang="ts">
  import { teams } from '../../stores/teams.svelte'
  import { ui } from '../../stores/ui.svelte'
  import PaletteOptions from '../ui/PaletteOptions.svelte'
  import Sheet from '../ui/Sheet.svelte'

  function close() {
    ui.close('palettePicker')
  }

  function pick(paletteId: string) {
    ui.palettePicker?.onPick(paletteId)
    close()
  }
</script>

<Sheet
  id="palettePicker"
  title="Cor do time"
  closeLabel="Fechar seleção de cor"
  onclose={close}
>
  <div class="card p-4">
    <PaletteOptions
      selectedId={ui.palettePicker?.selectedId ?? null}
      usedIds={teams.usedPaletteIds()}
      onpick={pick}
    />
  </div>
  <p class="-mt-3 px-4 text-[0.8125rem] text-label-2">
    Cores apagadas já pertencem a outro time.
  </p>
</Sheet>
