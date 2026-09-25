<script lang="ts">
  import { sanitizeGamesToWin } from '../../lib/scoring'
  import type { ScoringMode } from '../../lib/types'
  import { settings } from '../../stores/settings.svelte'
  import { ui } from '../../stores/ui.svelte'
  import Modal from '../ui/Modal.svelte'
  import Toggle from '../ui/Toggle.svelte'

  // Rascunho: só vale depois de tocar em "Salvar".
  let scoringMode: ScoringMode = $state(settings.scoringMode)
  let gamesEnabled = $state(settings.gamesEnabled)
  let gamesToWin: number | null = $state(settings.gamesToWin)

  // Sempre que o modal abre, recomeça com os valores salvos.
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

<Modal id="settings" title="Configurações" closeLabel="Fechar configurações">
  {#snippet header()}
    <h2 class="modal-title">Configurações</h2>
    <p class="mt-1 text-center text-[10px] tracking-wide uppercase opacity-45">
      {__APP_VERSION__}
    </p>
  {/snippet}

  <div class="mt-4 space-y-3">
    <p class="field-label">Equipes</p>
    <button onclick={() => ui.open('teamsManager')} class="modal-secondary-btn">
      Times Cadastrados
    </button>
  </div>

  <div>
    <label for="scoring-mode" class="field-label">Pontuação</label>
    <select id="scoring-mode" bind:value={scoringMode} class="form-control">
      <option value="official">Oficial (15,30,40)</option>
      <option value="simplified">Simplificada (1,2,3)</option>
    </select>
  </div>

  <div class="flex items-center justify-between gap-4">
    <span class="field-label">Definir quantos games para vencer o set</span>
    <Toggle bind:checked={gamesEnabled} label="Limitar games do set" />
  </div>

  {#if gamesEnabled}
    <input
      type="number"
      min="1"
      step="1"
      inputmode="numeric"
      placeholder="Ex: 3"
      aria-label="Games para vencer o set"
      bind:value={gamesToWin}
      class="form-control"
    />
  {/if}

  <button onclick={save} class="modal-primary-btn">Salvar</button>
</Modal>
