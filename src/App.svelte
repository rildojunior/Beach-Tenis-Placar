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

<AppHeader />

<main class="main-shell">
  <GamesPanel />

  <section class="px-4 py-2">
    <h4 class="section-title">Pontuação da Partida</h4>
    <div class="flex gap-3">
      <ScoreCard team="A" />
      <ScoreCard team="B" />
    </div>
  </section>

  <section class="mt-6 px-6 pb-8">
    <div class="grid grid-cols-2 gap-6">
      <PointButtons team="A" />
      <PointButtons team="B" />
    </div>
  </section>

  <footer class="px-4 pb-6">
    <button onclick={() => match.finish()} class="finish-button">Finalizar Set</button>
  </footer>
</main>

<SettingsModal />
<TeamsManagerModal />
<TeamPickerModal />
<PalettePickerModal />
<WinnerModal />
<TieModal />
<HistoryModal />
<ClearHistoryModal />

<InstallPrompt />
