<!-- Campo "Novo time" com escolha de cor. Usado no cadastro e na seleção de times. -->
<script lang="ts">
  import { getPaletteById } from '../lib/palettes'
  import { teams } from '../stores/teams.svelte'
  import { ui } from '../stores/ui.svelte'
  import PaletteSwatch from './ui/PaletteSwatch.svelte'

  const inputId = $props.id()

  let name = $state('')
  let chosenPaletteId: string | null = $state(null)
  let error = $state('')

  // Se a cor escolhida passou a ser usada por outro time, sugere a próxima livre.
  const paletteId = $derived(
    chosenPaletteId && !teams.usedPaletteIds().has(chosenPaletteId)
      ? chosenPaletteId
      : teams.firstAvailablePaletteId()
  )
  const palette = $derived(getPaletteById(paletteId))

  function choosePalette() {
    ui.pickPalette({
      selectedId: paletteId,
      onPick: id => (chosenPaletteId = id)
    })
  }

  function submit(event: SubmitEvent) {
    event.preventDefault()
    if (!name.trim()) return

    error = teams.add(name, paletteId) ?? ''
    if (!error) {
      name = ''
      chosenPaletteId = null
    }
  }
</script>

<form class="space-y-3" onsubmit={submit}>
  <label for={inputId} class="field-label">Novo time</label>
  <div class="flex gap-2">
    <input
      id={inputId}
      type="text"
      bind:value={name}
      oninput={() => (error = '')}
      placeholder="Ex: Jogador 1 e Jogador 2"
      class="form-control mt-0!"
      maxlength="40"
      autocomplete="off"
    />
    <button
      type="button"
      onclick={choosePalette}
      class="palette-menu-trigger w-12! shrink-0"
      aria-label="Escolher cor do time"
      disabled={!palette}
    >
      {#if palette}<PaletteSwatch color={palette.primary} />{/if}
    </button>
    <button
      type="submit"
      class="modal-primary-btn w-auto! px-4"
      aria-label="Adicionar time"
    >
      +
    </button>
  </div>
  {#if error}
    <p class="text-xs text-accent-orange" role="alert">{error}</p>
  {/if}
</form>
