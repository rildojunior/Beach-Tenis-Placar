<!-- Campo "Novo time" com escolha de cor. Usado no cadastro e na seleção de times. -->
<script lang="ts">
  import { getPaletteById } from '../lib/palettes'
  import { teams } from '../stores/teams.svelte'
  import { ui } from '../stores/ui.svelte'

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

<form onsubmit={submit}>
  <label for={inputId} class="section-label block">Novo time</label>
  <div class="field flex items-center gap-2 py-1.5 pr-1.5 pl-2">
    <button
      type="button"
      onclick={choosePalette}
      class="flex size-9 shrink-0 items-center justify-center rounded-full"
      aria-label="Escolher cor do time{palette ? ` (${palette.label})` : ''}"
      disabled={!palette}
    >
      <span
        class="size-6 rounded-full"
        style:background={palette?.primary ?? 'var(--color-fill-strong)'}
      ></span>
    </button>
    <input
      id={inputId}
      type="text"
      bind:value={name}
      oninput={() => (error = '')}
      placeholder="Nome da dupla"
      class="min-w-0 flex-1 bg-transparent text-[1.0625rem] outline-none placeholder:text-label-3"
      maxlength="40"
      autocomplete="off"
      enterkeyhint="done"
    />
    <button
      type="submit"
      class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-black disabled:bg-fill disabled:text-label-3"
      aria-label="Adicionar time"
      disabled={!name.trim()}
    >
      <span class="material-symbols-outlined text-[1.375rem]!">add</span>
    </button>
  </div>
  {#if error}
    <p class="px-4 pt-1.5 text-[0.8125rem] text-destructive" role="alert">{error}</p>
  {/if}
</form>
