import { state } from './state.js'
import {
  loadHistory,
  loadScore,
  loadSettings,
  loadTeams,
  saveScore,
  saveSettings,
  saveTeams,
  syncTeamNamesFromSelection
} from './storage.js'
import {
  applyGamesToggleUI,
  closeModal,
  getRefs,
  openModal,
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

async function syncAppVersionLabel() {
  if (!refs.appVersionLabel) return

  try {
    const response = await fetch('./service-worker.js', { cache: 'no-store' })
    const source = await response.text()
    const match = source.match(/const SW_VERSION = '([^']+)'/)

    refs.appVersionLabel.textContent = match?.[1] ? `${match[1]}` : '-'
  } catch {
    refs.appVersionLabel.textContent = '-'
  }
}

function syncSettingsUI() {
  refs.scoringMode.value = state.settings.scoringMode
  refs.gamesToWin.value = state.settings.gamesToWin
  applyGamesToggleUI(refs)
}

function persistAndUpdateScore() {
  saveScore()
  updateScoreUI(refs)
}

function parseEditedGamesValue(rawValue, maxAllowed) {
  const parsed = Number(rawValue.trim())
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > maxAllowed) return null
  return parsed
}

function editGamesScore(team) {
  if (team !== 'A' && team !== 'B') return

  const scoreKey = team === 'A' ? 'gamesA' : 'gamesB'
  const teamName = state.teamNames[team] || `Time ${team}`
  const currentValue = String(state.score[scoreKey])
  const maxAllowed = state.settings.gamesEnabled
    ? Math.max(0, state.settings.gamesToWin - 1)
    : 99
  const limitHint = state.settings.gamesEnabled
    ? `0 a ${maxAllowed} (deve ser menor que ${state.settings.gamesToWin})`
    : '0 a 99'

  const rawValue = window.prompt(
    `Digite o novo valor de games para ${teamName} (${limitHint}).`,
    currentValue
  )

  if (rawValue === null) return

  const parsedValue = parseEditedGamesValue(rawValue, maxAllowed)

  if (parsedValue === null) {
    window.alert(`Valor inválido para games. Use um número inteiro entre 0 e ${maxAllowed}.`)
    return
  }

  state.score[scoreKey] = parsedValue
  checkMatchEnd()
  persistAndUpdateScore()
}

function getPresetById(presetId) {
  return state.teamPresets.find(preset => preset.id === presetId) || null
}

function getSafeFallbackPresetId(blockedPresetId) {
  const firstAvailable = state.teamPresets.find(
    preset => preset.id !== blockedPresetId
  )

  if (firstAvailable) return firstAvailable.id
  return blockedPresetId === 'default-a' ? 'default-b' : 'default-a'
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function syncTeamSelectionUI() {
  syncTeamNamesFromSelection()
  updateTeamNamesUI(refs)
}

function persistTeamsAndUI() {
  syncTeamSelectionUI()
  saveTeams()
}

function getPresetsForDisplay() {
  return [...state.teamPresets].reverse()
}

function renderTeamPresetsManager() {
  if (!refs.teamPresetsList) return

  if (state.teamPresets.length === 0) {
    refs.teamPresetsList.innerHTML = `
      <p class="text-center text-sm opacity-50">Nenhum time cadastrado</p>
    `
    return
  }

  refs.teamPresetsList.innerHTML = getPresetsForDisplay()
    .map(preset => {
      const isSelectedA = state.teamSelection.A === preset.id
      const isSelectedB = state.teamSelection.B === preset.id
      const selectedTag =
        isSelectedA || isSelectedB
          ? '<span class="text-[10px] uppercase tracking-widest opacity-50">Jogando</span>'
          : ''

      const deleteButton = preset.locked
        ? '<span class="text-[10px] uppercase tracking-widest opacity-35">Padrão</span>'
        : `<button onclick="deleteTeamPreset('${preset.id}')" class="text-[10px] uppercase tracking-widest text-accent-orange opacity-80 hover:opacity-100">Excluir</button>`

      return `
        <div class="bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="text-sm font-semibold break-words leading-snug">${escapeHtml(preset.name)}</p>
            ${selectedTag}
          </div>
          <div class="shrink-0">${deleteButton}</div>
        </div>
      `
    })
    .join('')
}

function renderTeamPickerOptions() {
  if (!refs.teamPickerList || !refs.teamPickerTitle || !state.activeTeamPicker) return

  const teamKey = state.activeTeamPicker
  const otherTeamKey = teamKey === 'A' ? 'B' : 'A'
  const selectedOtherPresetId = state.teamSelection[otherTeamKey]

  refs.teamPickerTitle.textContent = `Selecionar Time ${teamKey}`

  refs.teamPickerList.innerHTML = getPresetsForDisplay()
    .map(preset => {
      const isCurrent = state.teamSelection[teamKey] === preset.id
      const isBlocked = selectedOtherPresetId === preset.id
      const canDelete = !preset.locked

      return `
        <div class="rounded-xl border px-3 py-3 transition ${isCurrent ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5'}">
          <div class="flex items-center gap-2">
            <button
              onclick="selectTeamPreset('${preset.id}')"
              class="flex-1 text-left ${isBlocked ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-90'}"
              ${isBlocked ? 'disabled' : ''}
            >
              <div class="flex items-center justify-between gap-3">
                <span class="text-sm font-semibold break-words leading-snug">${escapeHtml(preset.name)}</span>
                <span class="text-[10px] uppercase tracking-widest opacity-60 shrink-0">${isCurrent ? 'Selecionado' : isBlocked ? 'Em uso no outro time' : 'Selecionar'}</span>
              </div>
            </button>
            ${canDelete ? `<button onclick="deleteTeamPresetFromPicker('${preset.id}')" aria-label="Excluir time" class="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 text-accent-orange flex items-center justify-center"><span class="material-symbols-outlined text-[18px]">delete</span></button>` : ''}
          </div>
        </div>
      `
    })
    .join('')
}

function addTeamPresetFromInput(input) {
  const value = input?.value.trim() || ''
  if (!value) return

  const alreadyExists = state.teamPresets.some(
    preset => preset.name.toLowerCase() === value.toLowerCase()
  )

  if (alreadyExists) {
    if (input) input.value = ''
    return
  }

  state.teamPresets.push({
    id: `team-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: value,
    locked: false
  })

  if (refs.newTeamPresetInput) refs.newTeamPresetInput.value = ''
  if (refs.teamPickerNewTeamInput) refs.teamPickerNewTeamInput.value = ''
  persistTeamsAndUI()
  renderTeamPresetsManager()
  renderTeamPickerOptions()
}

function addTeamPreset() {
  addTeamPresetFromInput(refs.newTeamPresetInput)
}

function addTeamPresetFromPicker() {
  addTeamPresetFromInput(refs.teamPickerNewTeamInput)
}

function deleteTeamPreset(presetId) {
  const preset = getPresetById(presetId)
  if (!preset || preset.locked) return

  state.teamPresets = state.teamPresets.filter(item => item.id !== presetId)

  if (state.teamSelection.A === presetId) {
    state.teamSelection.A = getSafeFallbackPresetId(state.teamSelection.B)
  }

  if (state.teamSelection.B === presetId) {
    state.teamSelection.B = getSafeFallbackPresetId(state.teamSelection.A)
  }

  if (state.teamSelection.A === state.teamSelection.B) {
    state.teamSelection.B = getSafeFallbackPresetId(state.teamSelection.A)
  }

  persistTeamsAndUI()
  renderTeamPresetsManager()
  renderTeamPickerOptions()
}

function deleteTeamPresetFromPicker(presetId) {
  deleteTeamPreset(presetId)
}

function openTeamsManager() {
  renderTeamPresetsManager()
  openModal('teamsManagerModal')
}

function closeTeamsManager() {
  closeModal('teamsManagerModal')
}

function openTeamPicker(teamKey) {
  state.activeTeamPicker = teamKey
  if (refs.teamPickerNewTeamInput) {
    refs.teamPickerNewTeamInput.value = ''
  }
  renderTeamPickerOptions()
  openModal('teamPickerModal')
}

function closeTeamPicker() {
  state.activeTeamPicker = null
  closeModal('teamPickerModal')
}

function selectTeamPreset(presetId) {
  if (!state.activeTeamPicker) return

  const teamKey = state.activeTeamPicker
  const otherTeamKey = teamKey === 'A' ? 'B' : 'A'

  if (state.teamSelection[otherTeamKey] === presetId) return
  if (!getPresetById(presetId)) return

  state.teamSelection[teamKey] = presetId
  persistTeamsAndUI()
  closeTeamPicker()
}

function resetPoints() {
  state.score.pointsA = 0
  state.score.pointsB = 0
}

function checkMatchEnd() {
  if (!state.settings.gamesEnabled) return

  if (
    state.score.gamesA === state.settings.gamesToWin ||
    state.score.gamesB === state.settings.gamesToWin
  ) {
    const winnerKey = state.score.gamesA > state.score.gamesB ? 'A' : 'B'
    showWinner(winnerKey, refs)
  }
}

function addPoint(team) {
  if (team === 'A') {
    state.score.pointsA += 1
    if (state.score.pointsA === 4) {
      state.score.gamesA += 1
      resetPoints()
    }
  } else {
    state.score.pointsB += 1
    if (state.score.pointsB === 4) {
      state.score.gamesB += 1
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
    gamesA: 0,
    gamesB: 0
  }

  persistAndUpdateScore()
}

function finishMatch() {
  const { gamesA, gamesB } = state.score

  if (gamesA === 0 && gamesB === 0) {
    resetGame(false)
    return
  }

  if (gamesA === gamesB) {
    openModal('tieModal')
    return
  }

  const winnerKey = gamesA > gamesB ? 'A' : 'B'
  showWinner(winnerKey, refs)
}

function openSettings() {
  openModal('settingsModal')
}

function closeSettings() {
  closeModal('settingsModal')
}

function applySettings() {
  state.settings.scoringMode = refs.scoringMode.value

  const parsedGamesToWin = Number(refs.gamesToWin.value)
  state.settings.gamesToWin = parsedGamesToWin > 0 ? parsedGamesToWin : 1

  saveSettings()
  closeSettings()
}

function toggleGamesEnabled() {
  state.settings.gamesEnabled = !state.settings.gamesEnabled
  applyGamesToggleUI(refs)
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

function bindTeamManagerInput() {
  if (!refs.newTeamPresetInput) return

  refs.newTeamPresetInput.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    addTeamPreset()
  })

  refs.teamPickerNewTeamInput?.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    addTeamPresetFromPicker()
  })
}

function exposeGlobals() {
  window.addPoint = addPoint
  window.removePoint = removePoint
  window.finishMatch = finishMatch
  window.resetGame = () => resetGame(true)
  window.openSettings = openSettings
  window.closeSettings = closeSettings
  window.toggleGamesEnabled = toggleGamesEnabled
  window.applySettings = applySettings
  window.openTeamsManager = openTeamsManager
  window.closeTeamsManager = closeTeamsManager
  window.openTeamPicker = openTeamPicker
  window.closeTeamPicker = closeTeamPicker
  window.addTeamPreset = addTeamPreset
  window.addTeamPresetFromPicker = addTeamPresetFromPicker
  window.deleteTeamPreset = deleteTeamPreset
  window.deleteTeamPresetFromPicker = deleteTeamPresetFromPicker
  window.selectTeamPreset = selectTeamPreset
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
  window.editGamesScore = editGamesScore
}

function boot() {
  syncAppVersionLabel()

  loadSettings()
  loadScore()
  loadTeams()
  loadHistory()

  syncSettingsUI()
  updateTeamNamesUI(refs)
  updateScoreUI(refs)

  bindTeamManagerInput()
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
