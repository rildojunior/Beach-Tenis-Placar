<script lang="ts">
  import { presetColors, teams } from '../../stores/teams.svelte'
  import NewTeamForm from '../NewTeamForm.svelte'
  import Modal from '../ui/Modal.svelte'
  import PaletteOptions from '../ui/PaletteOptions.svelte'
  import PaletteSwatch from '../ui/PaletteSwatch.svelte'

  const isPlaying = (id: string) => teams.selection.A === id || teams.selection.B === id
</script>

<Modal id="teamsManager" title="Cadastrar Times" closeLabel="Fechar cadastro de times">
  <NewTeamForm />

  <div class="max-h-[45vh] space-y-2 overflow-y-auto pr-1">
    {#each teams.presetsForDisplay as preset (preset.id)}
      {@const colors = presetColors(preset)}
      <div class="space-y-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm leading-snug font-semibold break-words">{preset.name}</p>
            <div class="mt-1 flex items-center gap-2">
              <PaletteSwatch color={colors.primary} />
              {#if isPlaying(preset.id)}
                <span class="text-[10px] tracking-widest uppercase opacity-50"
                  >Jogando</span
                >
              {/if}
            </div>
          </div>
          <div class="shrink-0">
            {#if preset.locked}
              <span class="text-[10px] tracking-widest uppercase opacity-35">Padrão</span>
            {:else}
              <button
                onclick={() => teams.remove(preset.id)}
                class="text-[10px] tracking-widest text-accent-orange uppercase opacity-80 hover:opacity-100"
              >
                Excluir
              </button>
            {/if}
          </div>
        </div>
        <div>
          <p class="mb-1 text-[10px] tracking-widest uppercase opacity-45">Cor do time</p>
          <PaletteOptions
            selectedId={colors.paletteId}
            usedIds={teams.usedPaletteIds(preset.id)}
            onpick={paletteId => teams.setPalette(preset.id, paletteId)}
          />
        </div>
      </div>
    {:else}
      <p class="text-center text-sm opacity-50">Nenhum time cadastrado</p>
    {/each}
  </div>
</Modal>
