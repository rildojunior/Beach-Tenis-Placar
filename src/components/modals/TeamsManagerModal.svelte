<script lang="ts">
  import { slide } from 'svelte/transition'
  import { SPRING_DEFAULT, springEasing } from '../../lib/spring'
  import { presetColors, teams } from '../../stores/teams.svelte'
  import NewTeamForm from '../NewTeamForm.svelte'
  import PaletteOptions from '../ui/PaletteOptions.svelte'
  import Sheet from '../ui/Sheet.svelte'

  const reveal = springEasing(SPRING_DEFAULT)

  // Só um time mostra as cores por vez: o caminho comum fica limpo.
  let expanded: string | null = $state(null)

  const isPlaying = (id: string) => teams.selection.A === id || teams.selection.B === id
</script>

<Sheet id="teamsManager" title="Times" closeLabel="Fechar cadastro de times">
  <NewTeamForm />

  <section>
    <h3 class="section-label">Cadastrados</h3>
    <div class="group">
      {#each teams.presetsForDisplay as preset (preset.id)}
        {@const colors = presetColors(preset)}
        {@const open = expanded === preset.id}
        <div>
          <div class="row">
            <button
              class="flex min-w-0 flex-1 items-center gap-3 text-left"
              onclick={() => (expanded = open ? null : preset.id)}
              aria-expanded={open}
              aria-label="Cor de {preset.name}"
            >
              <span
                class="size-3.5 shrink-0 rounded-full"
                style:background={colors.primary}
              ></span>
              <span class="min-w-0 flex-1 truncate">{preset.name}</span>
              {#if isPlaying(preset.id)}
                <span class="text-[0.8125rem] text-label-2">Jogando</span>
              {/if}
              <span
                class="material-symbols-outlined text-[1.25rem]! text-label-3 transition-transform"
                class:rotate-90={open}>chevron_right</span
              >
            </button>
            {#if !preset.locked}
              <button
                onclick={() => teams.remove(preset.id)}
                class="-mr-2 flex size-9 items-center justify-center rounded-full text-destructive"
                aria-label="Excluir {preset.name}"
              >
                <span class="material-symbols-outlined text-[1.25rem]!">delete</span>
              </button>
            {/if}
          </div>
          {#if open}
            <div class="px-4 pb-3" transition:slide={reveal}>
              <PaletteOptions
                selectedId={colors.paletteId}
                usedIds={teams.usedPaletteIds(preset.id)}
                onpick={paletteId => teams.setPalette(preset.id, paletteId)}
              />
            </div>
          {/if}
        </div>
      {/each}
    </div>
    <p class="px-4 pt-1.5 text-[0.8125rem] text-label-2">
      Toque em um time para trocar a cor. Os times padrão não podem ser excluídos.
    </p>
  </section>
</Sheet>
