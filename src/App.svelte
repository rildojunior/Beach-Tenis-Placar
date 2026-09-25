<script lang="ts">
  import AppHeader from './components/AppHeader.svelte'
  import GamesPanel from './components/GamesPanel.svelte'
  import InstallPrompt from './components/InstallPrompt.svelte'
  import PointButtons from './components/PointButtons.svelte'
  import ScoreCard from './components/ScoreCard.svelte'
  import ClearHistoryModal from './components/modals/ClearHistoryModal.svelte'
  import HistoryModal from './components/modals/HistoryModal.svelte'
  import PalettePickerModal from './components/modals/PalettePickerModal.svelte'
  import SettingsModal from './components/modals/SettingsModal.svelte'
  import TeamPickerModal from './components/modals/TeamPickerModal.svelte'
  import TeamsManagerModal from './components/modals/TeamsManagerModal.svelte'
  import TieModal from './components/modals/TieModal.svelte'
  import WinnerModal from './components/modals/WinnerModal.svelte'
  import { match } from './stores/match.svelte'
  import { ui } from './stores/ui.svelte'

  // Trava a rolagem da página enquanto houver modal aberto.
  $effect(() => {
    document.body.style.overflow = ui.anyOpen ? 'hidden' : ''
  })
</script>

<div class={['app-surface', ui.sheetOpen && 'app-surface--back']} inert={ui.anyOpen}>
  <AppHeader />

  <main class="main-shell">
    <GamesPanel />

    <section>
      <h2 class="section-label">Pontos</h2>
      <div class="score-grid">
        <ScoreCard team="A" />
        <ScoreCard team="B" />
      </div>
    </section>

    <div class="grid grid-cols-2 gap-3">
      <PointButtons team="A" />
      <PointButtons team="B" />
    </div>

    <button onclick={() => match.finish()} class="finish-button mt-auto"
      >Finalizar set</button
    >
  </main>
</div>

<SettingsModal />
<TeamsManagerModal />
<TeamPickerModal />
<PalettePickerModal />
<WinnerModal />
<TieModal />
<HistoryModal />
<ClearHistoryModal />

<InstallPrompt />
