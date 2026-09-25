<script lang="ts">
  import { sanitizeGamesToWin } from '../../lib/scoring'
  import type { ScoringMode } from '../../lib/types'
  import { settings } from '../../stores/settings.svelte'
  import { teams } from '../../stores/teams.svelte'
  import { ui } from '../../stores/ui.svelte'
  import RollingNumber from '../ui/RollingNumber.svelte'
  import Segmented from '../ui/Segmented.svelte'
  import Sheet from '../ui/Sheet.svelte'
  import Stepper from '../ui/Stepper.svelte'
  import Toggle from '../ui/Toggle.svelte'

  // Rascunho: só vale depois de tocar em "Salvar".
  let scoringMode: ScoringMode = $state(settings.scoringMode)
  let gamesEnabled = $state(settings.gamesEnabled)
  let gamesToWin = $state(settings.gamesToWin)

  // Sempre que a folha abre, recomeça com os valores salvos.
  $effect(() => {
    if (!ui.isOpen('settings')) return
    scoringMode = settings.scoringMode
    gamesEnabled = settings.gamesEnabled
    gamesToWin = settings.gamesToWin
  })

  function save() {
    settings.scoringMode = scoringMode
    settings.gamesEnabled = gamesEnabled
    settings.gamesToWin = sanitizeGamesToWin(gamesToWin)
    ui.close('settings')
  }
</script>

<Sheet id="settings" title="Configurações" closeLabel="Fechar configurações">
  {#snippet subtitle()}
    <p class="text-center text-[0.6875rem] text-label-3">{__APP_VERSION__}</p>
  {/snippet}

  <section>
    <h3 class="section-label">Pontuação</h3>
    <Segmented
      label="Tipo de pontuação"
      bind:value={scoringMode}
      options={[
        { value: 'official', label: '15 · 30 · 40' },
        { value: 'simplified', label: '1 · 2 · 3' }
      ]}
    />
  </section>

  <section>
    <h3 class="section-label">Set</h3>
    <div class="group">
      <div class="row justify-between">
        <span>Limitar games do set</span>
        <Toggle bind:checked={gamesEnabled} label="Limitar games do set" />
      </div>
      {#if gamesEnabled}
        <div class="row justify-between">
          <span>
            Vence com
            <span class="display-number font-semibold text-primary">
              <RollingNumber value={gamesToWin} />
            </span>
            {gamesToWin === 1 ? 'game' : 'games'}
          </span>
          <Stepper
            bind:value={gamesToWin}
            min={1}
            max={20}
            label="Games para vencer o set"
          />
        </div>
      {/if}
    </div>
  </section>

  <section>
    <h3 class="section-label">Equipes</h3>
    <div class="group">
      <button
        class="row row-button justify-between"
        onclick={() => ui.open('teamsManager')}
      >
        <span>Times cadastrados</span>
        <span class="flex items-center gap-1 text-label-2">
          {teams.presets.length}
          <span class="material-symbols-outlined text-[1.25rem]! text-label-3"
            >chevron_right</span
          >
        </span>
      </button>
    </div>
  </section>

  <button onclick={save} class="btn-primary">Salvar</button>
</Sheet>
