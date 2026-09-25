<script lang="ts">
  import { otherTeam } from '../../lib/types'
  import { presetColors, teams } from '../../stores/teams.svelte'
  import { ui } from '../../stores/ui.svelte'
  import NewTeamForm from '../NewTeamForm.svelte'
  import Modal from '../ui/Modal.svelte'
  import PaletteSwatch from '../ui/PaletteSwatch.svelte'

  const team = $derived(ui.pickingTeam ?? 'A')

  function close() {
    ui.close('teamPicker')
    ui.pickingTeam = null
  }

  function select(presetId: string) {
    if (teams.select(team, presetId)) close()
  }
</script>

<Modal
  id="teamPicker"
  title="Selecionar Time {team}"
  closeLabel="Fechar seleção de time"
  onclose={close}
>
  <NewTeamForm />

  <div class="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
    {#each teams.presetsForDisplay as preset (preset.id)}
      {@const current = teams.selection[team] === preset.id}
      {@const blocked = teams.selection[otherTeam(team)] === preset.id}
      <div
        class={[
          'rounded-xl border px-3 py-3 transition',
          current ? 'border-white/30 bg-white/10' : 'border-white/10 bg-white/5'
        ]}
      >
        <div class="flex items-center gap-2">
          <button
            onclick={() => select(preset.id)}
            class={['flex-1 text-left', blocked ? 'opacity-40' : 'hover:opacity-90']}
            disabled={blocked}
          >
            <div class="flex items-center justify-between gap-3">
              <span
                class="flex items-center gap-2 text-sm leading-snug font-semibold break-words"
              >
                <PaletteSwatch color={presetColors(preset).primary} />
                {preset.name}
              </span>
              <span class="shrink-0 text-[10px] tracking-widest uppercase opacity-60">
                {current ? 'Selecionado' : blocked ? 'Em uso' : 'Selecionar'}
              </span>
            </div>
          </button>
          {#if !preset.locked}
            <button
              onclick={() => teams.remove(preset.id)}
              aria-label="Excluir {preset.name}"
              class="flex size-8 items-center justify-center rounded-lg bg-white/5 text-accent-orange hover:bg-white/10"
            >
              <span class="material-symbols-outlined text-[18px]">delete</span>
            </button>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</Modal>
