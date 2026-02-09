import { state } from './state.js'
import {
  loadHistory,
  loadScore,
  loadSettings,
  loadTeamNames,
  saveScore,
  saveSettings,
  saveTeamNames
} from './storage.js'
import {
  applySetsToggleUI,
  closeModal,
  getRefs,
  openModal,
  setupTeamNameEditing,
  setupTeamNameInputs,
  showWinner,
  updateScoreUI,
  updateTeamNamesUI
} from './ui.js'
import {
  closeClearHistoryModal,
  closeHistory,
  confirmClearHistory,
  exportHistoryImage,
  openClearHistoryModal,
  openHistory,
  renderHistory,
  saveMatchToHistory
} from './history.js'
import {
  dismissInstallPrompt,
  installApp,
  registerServiceWorker,
  setupInstall
} from './install.js'

const refs = getRefs()

function syncSettingsUI() {
  refs.scoringMode.value = state.settings.scoringMode
  refs.setsToWin.value = state.settings.setsToWin
  applySetsToggleUI(refs)
}

function onTeamNameChanged() {
  saveTeamNames()
  updateTeamNamesUI(refs)
}

function persistAndUpdateScore() {
  saveScore()
  updateScoreUI(refs)
}

function resetPoints() {
  state.score.pointsA = 0
  state.score.pointsB = 0
}

function checkMatchEnd() {
  if (!state.settings.setsEnabled) return

  if (
    state.score.setsA === state.settings.setsToWin ||
    state.score.setsB === state.settings.setsToWin
  ) {
    const winnerKey = state.score.setsA > state.score.setsB ? 'A' : 'B'
    showWinner(winnerKey, refs)
  }
}

function addPoint(team) {
  if (team === 'A') {
    state.score.pointsA += 1
    if (state.score.pointsA === 4) {
      state.score.setsA += 1
      resetPoints()
    }
  } else {
    state.score.pointsB += 1
    if (state.score.pointsB === 4) {
      state.score.setsB += 1
      resetPoints()
    }
  }

  checkMatchEnd()
  persistAndUpdateScore()
}

function removePoint(team) {
  if (team === 'A' && state.score.pointsA > 0) {
    state.score.pointsA -= 1
  }

  if (team === 'B' && state.score.pointsB > 0) {
    state.score.pointsB -= 1
  }

  persistAndUpdateScore()
}

function resetGame(saveInHistory = true) {
  if (saveInHistory) {
    saveMatchToHistory()
  }

  state.score = {
    pointsA: 0,
    pointsB: 0,
    setsA: 0,
    setsB: 0
  }

  persistAndUpdateScore()
}

function finishMatch() {
  const { setsA, setsB } = state.score

  if (setsA === 0 && setsB === 0) {
    resetGame(false)
    return
  }

  if (setsA === setsB) {
    openModal('tieModal')
    return
  }

  const winnerKey = setsA > setsB ? 'A' : 'B'
  showWinner(winnerKey, refs)
}

function openSettings() {
  refs.teamNameAInput.value = state.teamNames.A
  refs.teamNameBInput.value = state.teamNames.B
  openModal('settingsModal')
}

function closeSettings() {
  closeModal('settingsModal')
}

function applySettings() {
  state.settings.scoringMode = refs.scoringMode.value

  const parsedSetsToWin = Number(refs.setsToWin.value)
  state.settings.setsToWin = parsedSetsToWin > 0 ? parsedSetsToWin : 1

  saveSettings()
  closeSettings()
}

function toggleSetsEnabled() {
  state.settings.setsEnabled = !state.settings.setsEnabled
  applySetsToggleUI(refs)
  saveSettings()
}

function closeWinner() {
  closeModal('winnerModal')
}

function openTieModal() {
  openModal('tieModal')
}

function closeTieModal() {
  closeModal('tieModal')
}

function handleTouchEnd(event) {
  const now = Date.now()

  if (now - state.lastTouchEnd <= 300) {
    event.preventDefault()
  }

  state.lastTouchEnd = now
}

function exposeGlobals() {
  window.addPoint = addPoint
  window.removePoint = removePoint
  window.finishMatch = finishMatch
  window.resetGame = () => resetGame(true)
  window.openSettings = openSettings
  window.closeSettings = closeSettings
  window.toggleSetsEnabled = toggleSetsEnabled
  window.applySettings = applySettings
  window.closeModal = closeModal
  window.closeWinner = closeWinner
  window.openTieModal = openTieModal
  window.closeTieModal = closeTieModal

  window.openHistory = () => openHistory(refs)
  window.closeHistory = closeHistory
  window.openClearHistoryModal = openClearHistoryModal
  window.closeClearHistoryModal = closeClearHistoryModal
  window.confirmClearHistory = () => confirmClearHistory(refs)
  window.exportHistoryImage = () => exportHistoryImage(refs)

  window.installApp = () => installApp(refs)
  window.dismissInstallPrompt = () => dismissInstallPrompt(refs)
}

function boot() {
  loadSettings()
  loadScore()
  loadTeamNames()
  loadHistory()

  syncSettingsUI()
  updateTeamNamesUI(refs)
  updateScoreUI(refs)

  setupTeamNameEditing(refs, onTeamNameChanged)
  setupTeamNameInputs(refs, onTeamNameChanged)
  setupInstall(refs)
  registerServiceWorker()

  document.addEventListener('touchend', handleTouchEnd, { passive: false })

  if (state.matchHistory.length === 0) {
    refs.exportHistoryBtn.disabled = true
  } else {
    renderHistory(refs)
  }

  exposeGlobals()
}

boot()
