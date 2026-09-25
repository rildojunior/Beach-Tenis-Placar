<script lang="ts">
  import { otherTeam } from '../../lib/types'
  import { presetColors, teams } from '../../stores/teams.svelte'
  import { ui } from '../../stores/ui.svelte'
  import NewTeamForm from '../NewTeamForm.svelte'
  import Sheet from '../ui/Sheet.svelte'

  const team = $derived(ui.pickingTeam ?? 'A')

  function close() {
    ui.close('teamPicker')
  }

  function select(presetId: string) {
    if (teams.select(team, presetId)) close()
  }
</script>

<Sheet
  id="teamPicker"
  title="Time {team}"
  closeLabel="Fechar seleção de time"
  onclose={close}
>
  <NewTeamForm />

  <section>
    <h3 class="section-label">Escolha quem joga deste lado</h3>
    <div class="group">
      {#each teams.presetsForDisplay as preset (preset.id)}
        {@const current = teams.selection[team] === preset.id}
        {@const blocked = teams.selection[otherTeam(team)] === preset.id}
        <div class="row">
          <button
            onclick={() => select(preset.id)}
            class="flex min-w-0 flex-1 items-center gap-3 text-left disabled:opacity-40"
            disabled={blocked}
            aria-current={current}
          >
            <span
              class="size-3.5 shrink-0 rounded-full"
              style:background={presetColors(preset).primary}
            ></span>
            <span class="line-clamp-2 min-w-0 flex-1 break-words">{preset.name}</span>
            {#if current}
              <span class="material-symbols-outlined text-[1.375rem]! text-primary"
                >check</span
              >
            {:else if blocked}
              <span class="text-[0.8125rem] text-label-2">Time {otherTeam(team)}</span>
            {/if}
          </button>
          {#if !preset.locked && !current && !blocked}
            <button
              onclick={() => teams.remove(preset.id)}
              aria-label="Excluir {preset.name}"
              class="-mr-2 flex size-9 items-center justify-center rounded-full text-destructive"
            >
              <span class="material-symbols-outlined text-[1.25rem]!">delete</span>
            </button>
          {/if}
        </div>
      {/each}
    </div>
  </section>
</Sheet>
