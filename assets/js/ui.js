import { state } from './state.js'
import { getContrastColor, getPaletteFallbackByIndex, normalizeTeamColors } from './team-colors.js'

export function getRefs() {
  return {
    pointsAEl: document.getElementById('pointsA'),
    pointsBEl: document.getElementById('pointsB'),
    gamesAEl: document.getElementById('gamesA'),
    gamesBEl: document.getElementById('gamesB'),
    cardA: document.getElementById('cardA'),
    cardB: document.getElementById('cardB'),
    addPointBtnA: document.getElementById('addPointBtnA'),
    addPointBtnB: document.getElementById('addPointBtnB'),
    appSubtitle: document.getElementById('appSubtitle'),
    gamesPanelTitle: document.getElementById('gamesPanelTitle'),
    teamNameA: document.getElementById('teamNameA'),
    teamNameB: document.getElementById('teamNameB'),
    teamNameAGame: document.getElementById('teamNameAGame'),
    teamNameBGame: document.getElementById('teamNameBGame'),
    scoringMode: document.getElementById('scoringMode'),
    gamesToWin: document.getElementById('gamesToWin'),
    gamesInputWrapper: document.getElementById('gamesInputWrapper'),
    toggleGames: document.getElementById('toggleGames'),
    toggleCircle: document.getElementById('toggleCircle'),
    newTeamPresetInput: document.getElementById('newTeamPresetInput'),
    newTeamPaletteOptions: document.getElementById('newTeamPaletteOptions'),
    teamPickerNewTeamInput: document.getElementById('teamPickerNewTeamInput'),
    teamPickerNewTeamPaletteOptions: document.getElementById('teamPickerNewTeamPaletteOptions'),
    newTeamPaletteModalTitle: document.getElementById('newTeamPaletteModalTitle'),
    newTeamPaletteModalList: document.getElementById('newTeamPaletteModalList'),
    teamPresetsList: document.getElementById('teamPresetsList'),
    teamPickerTitle: document.getElementById('teamPickerTitle'),
    teamPickerList: document.getElementById('teamPickerList'),
    winnerName: document.getElementById('winnerName'),
    historyList: document.getElementById('historyList'),
    exportHistoryBtn: document.getElementById('exportHistoryBtn'),
    historyCanvas: document.getElementById('historyCanvas'),
    installPrompt: document.getElementById('installPrompt'),
    appVersionLabel: document.getElementById('appVersionLabel')
  }
}

function getSelectedPresetColors(teamKey) {
  const preset = state.teamPresets.find(item => item.id === state.teamSelection[teamKey])
  const fallback = teamKey === 'A' ? getPaletteFallbackByIndex(0) : getPaletteFallbackByIndex(1)
  return normalizeTeamColors(preset?.colors, fallback)
}

export function applyMatchTeamTheme(refs) {
  const colorsA = getSelectedPresetColors('A')
  const colorsB = getSelectedPresetColors('B')

  const rootStyle = document.documentElement.style
  rootStyle.setProperty('--team-a-primary', colorsA.primary)
  rootStyle.setProperty('--team-b-primary', colorsB.primary)
  rootStyle.setProperty('--team-a-contrast', getContrastColor(colorsA.primary))
  rootStyle.setProperty('--team-b-contrast', getContrastColor(colorsB.primary))

  if (refs.teamNameA) refs.teamNameA.style.color = colorsA.primary
  if (refs.teamNameAGame) refs.teamNameAGame.style.color = colorsA.primary
  if (refs.cardA) refs.cardA.style.borderColor = colorsA.primary

  if (refs.teamNameB) refs.teamNameB.style.color = colorsB.primary
  if (refs.teamNameBGame) refs.teamNameBGame.style.color = colorsB.primary
  if (refs.cardB) refs.cardB.style.borderColor = colorsB.primary

  if (refs.addPointBtnA) {
    refs.addPointBtnA.style.backgroundColor = colorsA.primary
    refs.addPointBtnA.style.color = getContrastColor(colorsA.primary)
    refs.addPointBtnA.style.boxShadow = `0 10px 28px ${colorsA.primary}44`
  }

  if (refs.addPointBtnB) {
    refs.addPointBtnB.style.backgroundColor = colorsB.primary
    refs.addPointBtnB.style.color = getContrastColor(colorsB.primary)
    refs.addPointBtnB.style.boxShadow = `0 10px 28px ${colorsB.primary}44`
  }

}

export function updateTeamNamesUI(refs) {
  refs.teamNameA.textContent = state.teamNames.A
  refs.teamNameB.textContent = state.teamNames.B
  refs.teamNameAGame.textContent = state.teamNames.A
  refs.teamNameBGame.textContent = state.teamNames.B
}

export function applyGamesToggleUI(refs) {
  if (state.settings.gamesEnabled) {
    refs.toggleGames.classList.remove('bg-white/10')
    refs.toggleGames.classList.add('bg-primary')
    refs.toggleCircle.style.transform = 'translateX(24px)'
    refs.gamesInputWrapper.classList.remove('hidden')
    return
  }

  refs.toggleGames.classList.add('bg-white/10')
  refs.toggleGames.classList.remove('bg-primary')
  refs.toggleCircle.style.transform = 'translateX(0)'
  refs.gamesInputWrapper.classList.add('hidden')
}

function getDisplayPoint(points) {
  if (state.settings.scoringMode === 'official') {
    return ['0', '15', '30', '40'][points] || '40'
  }

  return points
}

function updateProgress() {
  const { pointsA, pointsB } = state.score
  const colorsA = getSelectedPresetColors('A')
  const colorsB = getSelectedPresetColors('B')

  document.querySelectorAll('.progressA').forEach((el, i) => {
    el.className = 'progressA progress-dot' + (i < pointsA ? ' active' : '')
    el.style.backgroundColor = i < pointsA ? colorsA.primary : 'rgba(255,255,255,0.10)'
  })

  document.querySelectorAll('.progressB').forEach((el, i) => {
    el.className = 'progressB progress-dot' + (i < pointsB ? ' active' : '')
    el.style.backgroundColor = i < pointsB ? colorsB.primary : 'rgba(255,255,255,0.10)'
  })
}

export function updateScoreUI(refs) {
  const { pointsA, pointsB, gamesA, gamesB } = state.score
  const colorsA = getSelectedPresetColors('A')
  const colorsB = getSelectedPresetColors('B')

  refs.pointsAEl.textContent = getDisplayPoint(pointsA)
  refs.pointsBEl.textContent = getDisplayPoint(pointsB)
  refs.gamesAEl.textContent = gamesA
  refs.gamesBEl.textContent = gamesB

  refs.cardA.style.setProperty('--leading-glow', `${colorsA.primary}55`)
  refs.cardB.style.setProperty('--leading-glow', `${colorsB.primary}55`)
  refs.cardA.classList.toggle('leading', pointsA > pointsB)
  refs.cardB.classList.toggle('leading', pointsB > pointsA)

  updateProgress()
}

function updateBodyScroll() {
  document.body.style.overflow = state.modalStack.length > 0 ? 'hidden' : ''
}

export function openModal(id) {
  const modal = document.getElementById(id)
  if (!modal) return
  if (state.modalStack.includes(id)) return

  state.modalStack.push(id)

  modal.style.zIndex = String(1000 + state.modalStack.length * 10)
  modal.classList.remove('hidden')
  modal.classList.add('flex', 'modal-enter')

  requestAnimationFrame(() => {
    modal.classList.add('modal-enter-active')
    modal.classList.remove('modal-enter')
  })

  updateBodyScroll()
}

export function closeModal(id) {
  const modal = document.getElementById(id)
  if (!modal) return
  if (state.modalStack[state.modalStack.length - 1] !== id) return

  state.modalStack.pop()

  modal.classList.add('modal-exit')
  requestAnimationFrame(() => {
    modal.classList.add('modal-exit-active')
    modal.classList.remove('modal-exit')
  })

  setTimeout(() => {
    modal.classList.add('hidden')
    modal.classList.remove('flex', 'modal-exit-active')
    modal.style.zIndex = ''
  }, 200)

  updateBodyScroll()
}

export function showWinner(teamKey, refs) {
  refs.winnerName.textContent = state.teamNames[teamKey]
  const winnerColors = getSelectedPresetColors(teamKey)
  refs.winnerName.style.color = winnerColors.primary
  openModal('winnerModal')
}

export function showInstallPrompt(refs) {
  if (localStorage.getItem('bt-install-dismissed')) return

  refs.installPrompt.classList.remove('hidden')
  refs.installPrompt.classList.add('install-enter')

  requestAnimationFrame(() => {
    refs.installPrompt.classList.add('install-enter-active')
    refs.installPrompt.classList.remove('install-enter')
  })
}

export function hideInstallPrompt(refs) {
  refs.installPrompt.classList.add('install-exit')

  requestAnimationFrame(() => {
    refs.installPrompt.classList.add('install-exit-active')
    refs.installPrompt.classList.remove('install-exit')
  })

  setTimeout(() => {
    refs.installPrompt.classList.add('hidden')
    refs.installPrompt.classList.remove('install-exit-active')
  }, 250)
}
