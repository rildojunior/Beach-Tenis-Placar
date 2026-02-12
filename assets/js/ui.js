import { state } from './state.js'

export function getRefs() {
  return {
    pointsAEl: document.getElementById('pointsA'),
    pointsBEl: document.getElementById('pointsB'),
    setsAEl: document.getElementById('setsA'),
    setsBEl: document.getElementById('setsB'),
    cardA: document.getElementById('cardA'),
    cardB: document.getElementById('cardB'),
    teamNameA: document.getElementById('teamNameA'),
    teamNameB: document.getElementById('teamNameB'),
    teamNameASet: document.getElementById('teamNameASet'),
    teamNameBSet: document.getElementById('teamNameBSet'),
    teamNameAInput: document.getElementById('teamNameAInput'),
    teamNameBInput: document.getElementById('teamNameBInput'),
    scoringMode: document.getElementById('scoringMode'),
    setsToWin: document.getElementById('setsToWin'),
    setsInputWrapper: document.getElementById('setsInputWrapper'),
    toggleSets: document.getElementById('toggleSets'),
    toggleCircle: document.getElementById('toggleCircle'),
    winnerName: document.getElementById('winnerName'),
    historyList: document.getElementById('historyList'),
    exportHistoryBtn: document.getElementById('exportHistoryBtn'),
    historyCanvas: document.getElementById('historyCanvas'),
    installPrompt: document.getElementById('installPrompt'),
    appVersionLabel: document.getElementById('appVersionLabel')
  }
}

function selectAllText(element) {
  const range = document.createRange()
  range.selectNodeContents(element)

  const selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(range)
}

export function updateTeamNamesUI(refs) {
  refs.teamNameA.textContent = state.teamNames.A
  refs.teamNameB.textContent = state.teamNames.B
  refs.teamNameASet.textContent = state.teamNames.A
  refs.teamNameBSet.textContent = state.teamNames.B
}

export function applySetsToggleUI(refs) {
  if (state.settings.setsEnabled) {
    refs.toggleSets.classList.remove('bg-white/10')
    refs.toggleSets.classList.add('bg-primary')
    refs.toggleCircle.style.transform = 'translateX(24px)'
    refs.setsInputWrapper.classList.remove('hidden')
    return
  }

  refs.toggleSets.classList.add('bg-white/10')
  refs.toggleSets.classList.remove('bg-primary')
  refs.toggleCircle.style.transform = 'translateX(0)'
  refs.setsInputWrapper.classList.add('hidden')
}

function getDisplayPoint(points) {
  if (state.settings.scoringMode === 'official') {
    return ['0', '15', '30', '40'][points] || '40'
  }

  return points
}

function updateProgress() {
  const { pointsA, pointsB } = state.score

  document.querySelectorAll('.progressA').forEach((el, i) => {
    el.className =
      'progressA h-1.5 w-6 rounded-full ' +
      (i < pointsA ? 'bg-primary active' : 'bg-white/10')
  })

  document.querySelectorAll('.progressB').forEach((el, i) => {
    el.className =
      'progressB h-1.5 w-6 rounded-full ' +
      (i < pointsB ? 'bg-accent-orange active' : 'bg-white/10')
  })
}

export function updateScoreUI(refs) {
  const { pointsA, pointsB, setsA, setsB } = state.score

  refs.pointsAEl.textContent = getDisplayPoint(pointsA)
  refs.pointsBEl.textContent = getDisplayPoint(pointsB)
  refs.setsAEl.textContent = setsA
  refs.setsBEl.textContent = setsB

  refs.cardA.classList.toggle('leading', pointsA > pointsB)
  refs.cardB.classList.toggle('leading', pointsB > pointsA)

  updateProgress()
}

export function setupTeamNameEditing(refs, onTeamNameChanged) {
  refs.teamNameA.addEventListener('focus', () => {
    setTimeout(() => selectAllText(refs.teamNameA), 0)
  })

  refs.teamNameB.addEventListener('focus', () => {
    setTimeout(() => selectAllText(refs.teamNameB), 0)
  })

  refs.teamNameA.addEventListener('blur', () => {
    const value = refs.teamNameA.textContent.trim()
    state.teamNames.A = value || 'Time A'
    onTeamNameChanged()
  })

  refs.teamNameB.addEventListener('blur', () => {
    const value = refs.teamNameB.textContent.trim()
    state.teamNames.B = value || 'Time B'
    onTeamNameChanged()
  })

  refs.teamNameA.addEventListener('keydown', event => {
    if (event.key === 'Enter') refs.teamNameA.blur()
  })

  refs.teamNameB.addEventListener('keydown', event => {
    if (event.key === 'Enter') refs.teamNameB.blur()
  })
}

export function setupTeamNameInputs(refs, onTeamNameChanged) {
  refs.teamNameAInput.addEventListener('input', () => {
    state.teamNames.A = refs.teamNameAInput.value.trim() || 'Time A'
    onTeamNameChanged()
  })

  refs.teamNameBInput.addEventListener('input', () => {
    state.teamNames.B = refs.teamNameBInput.value.trim() || 'Time B'
    onTeamNameChanged()
  })
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
  refs.winnerName.classList.remove('text-primary', 'text-accent-orange')
  refs.winnerName.classList.add(
    teamKey === 'A' ? 'text-primary' : 'text-accent-orange'
  )
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
