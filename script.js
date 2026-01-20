let settings = {
  scoringMode: 'simplified',
  setsEnabled: false, // 🔴 padrão: infinito
  setsToWin: 3
}

let matchHistory = []

let teamNames = {
  A: 'Time A',
  B: 'Time B'
}

const modalStack = []

const isStandalone =
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true

function selectAllText(element) {
  const range = document.createRange()
  range.selectNodeContents(element)

  const selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(range)
}

function updateTeamNamesUI() {
  document.getElementById('teamNameA').textContent = teamNames.A
  document.getElementById('teamNameB').textContent = teamNames.B

  document.getElementById('teamNameASet').textContent = teamNames.A
  document.getElementById('teamNameBSet').textContent = teamNames.B
}

let pointsA = 0,
  pointsB = 0,
  setsA = 0,
  setsB = 0

function loadSettings() {
  const s = localStorage.getItem('bt-settings')
  if (s) {
    settings = JSON.parse(s)
  } else {
    saveSettings() // salva padrão infinito na primeira vez
  }
  document.getElementById('scoringMode').value = settings.scoringMode
  document.getElementById('setsToWin').value = settings.setsToWin
  applySetsToggleUI()
}

function saveSettings() {
  localStorage.setItem('bt-settings', JSON.stringify(settings))
}

function loadTeamNames() {
  const saved = localStorage.getItem('bt-team-names')
  if (saved) {
    teamNames = JSON.parse(saved)
  }
}

function saveTeamNames() {
  localStorage.setItem('bt-team-names', JSON.stringify(teamNames))
}

function openSettings() {
  document.getElementById('teamNameAInput').value = teamNames.A
  document.getElementById('teamNameBInput').value = teamNames.B
  openModal('settingsModal')
}

function closeSettings() {
  closeModal('settingsModal')
}

function toggleSetsEnabled() {
  settings.setsEnabled = !settings.setsEnabled
  applySetsToggleUI()
  saveSettings()
}

function applySetsToggleUI() {
  const wrapper = document.getElementById('setsInputWrapper')
  const toggle = document.getElementById('toggleSets')
  const circle = document.getElementById('toggleCircle')

  if (settings.setsEnabled) {
    toggle.classList.remove('bg-white/10')
    toggle.classList.add('bg-primary')
    circle.style.transform = 'translateX(24px)'
    wrapper.classList.remove('hidden')
  } else {
    toggle.classList.add('bg-white/10')
    toggle.classList.remove('bg-primary')
    circle.style.transform = 'translateX(0)'
    wrapper.classList.add('hidden')
  }
}

function applySettings() {
  settings.scoringMode = document.getElementById('scoringMode').value
  const value = Number(document.getElementById('setsToWin').value)
  settings.setsToWin = value > 0 ? value : 1
  saveSettings()
  closeSettings()
}

function getDisplayPoint(points) {
  if (settings.scoringMode === 'official') {
    return ['0', '15', '30', '40'][points] || '40'
  }
  return points
}

function checkMatchEnd() {
  if (!settings.setsEnabled) return

  if (setsA === settings.setsToWin || setsB === settings.setsToWin) {
    const winnerKey = setsA > setsB ? 'A' : 'B'
    showWinner(winnerKey)
  }
}

function addPoint(team) {
  if (team === 'A') {
    pointsA++
    if (pointsA === 4) {
      setsA++
      resetPoints()
    }
  } else {
    pointsB++
    if (pointsB === 4) {
      setsB++
      resetPoints()
    }
  }
  checkMatchEnd()
  save()
  update()
}

function removePoint(team) {
  if (team === 'A' && pointsA > 0) pointsA--
  if (team === 'B' && pointsB > 0) pointsB--
  save()
  update()
}

function resetPoints() {
  pointsA = 0
  pointsB = 0
}

function finishMatch() {
  // 🔹 1. Sets 0x0 → apenas reseta, sem salvar histórico
  if (setsA === 0 && setsB === 0) {
    resetGameWithoutHistory()
    return
  }

  // 🔹 2. Sets empatados → exige desempate
  if (setsA === setsB) {
    openTieModal()
    return
  }

  // 🔹 3. Existe vencedor → mesmo fluxo do sets para vencer
  const winnerKey = setsA > setsB ? 'A' : 'B'
  showWinner(winnerKey)
}

function resetGame() {
  saveMatchToHistory()

  pointsA = pointsB = setsA = setsB = 0
  save()
  update()
}

function resetGameWithoutHistory() {
  pointsA = pointsB = setsA = setsB = 0
  save()
  update()
}

function updateProgress() {
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

function update() {
  pointsAEl.textContent = getDisplayPoint(pointsA)
  pointsBEl.textContent = getDisplayPoint(pointsB)
  setsAEl.textContent = setsA
  setsBEl.textContent = setsB

  cardA.classList.toggle('leading', pointsA > pointsB)
  cardB.classList.toggle('leading', pointsB > pointsA)

  updateProgress()
}

function save() {
  localStorage.setItem(
    'bt-score',
    JSON.stringify({ pointsA, pointsB, setsA, setsB })
  )
}

function load() {
  const d = JSON.parse(localStorage.getItem('bt-score'))
  if (!d) return
  ;({ pointsA, pointsB, setsA, setsB } = d)
  update()
}

let lastTouchEnd = 0

document.addEventListener(
  'touchend',
  function (event) {
    const now = Date.now()
    if (now - lastTouchEnd <= 300) {
      event.preventDefault()
    }
    lastTouchEnd = now
  },
  { passive: false }
)

function showWinner(teamKey) {
  const nameEl = document.getElementById('winnerName')
  const isTeamA = teamKey === 'A'

  nameEl.textContent = teamNames[teamKey]

  // limpa cores anteriores
  nameEl.classList.remove('text-primary', 'text-accent-orange')

  // aplica cor correta só no nome
  nameEl.classList.add(isTeamA ? 'text-primary' : 'text-accent-orange')

  openModal('winnerModal')
}

function closeWinner() {
  closeModal('winnerModal')
}

function setupTeamNameEditing() {
  const elA = document.getElementById('teamNameA')
  const elB = document.getElementById('teamNameB')

  elA.addEventListener('focus', () => {
    setTimeout(() => selectAllText(elA), 0)
  })

  elB.addEventListener('focus', () => {
    setTimeout(() => selectAllText(elB), 0)
  })

  elA.addEventListener('blur', () => {
    const value = elA.textContent.trim()
    teamNames.A = value || 'Time A'
    saveTeamNames()
    updateTeamNamesUI()
  })

  elB.addEventListener('blur', () => {
    const value = elB.textContent.trim()
    teamNames.B = value || 'Time B'
    saveTeamNames()
    updateTeamNamesUI()
  })

  elA.addEventListener('keydown', e => {
    if (e.key === 'Enter') elA.blur()
  })

  elB.addEventListener('keydown', e => {
    if (e.key === 'Enter') elB.blur()
  })
}

function openTieModal() {
  openModal('tieModal')
}

function closeTieModal() {
  closeModal('tieModal')
}

function setupTeamNameInputs() {
  const inputA = document.getElementById('teamNameAInput')
  const inputB = document.getElementById('teamNameBInput')

  inputA.addEventListener('input', () => {
    teamNames.A = inputA.value.trim() || 'Time A'
    saveTeamNames()
    updateTeamNamesUI()
  })

  inputB.addEventListener('input', () => {
    teamNames.B = inputB.value.trim() || 'Time B'
    saveTeamNames()
    updateTeamNamesUI()
  })
}

function loadHistory() {
  const h = localStorage.getItem('bt-history')
  if (h) matchHistory = JSON.parse(h)
}

function saveHistory() {
  localStorage.setItem('bt-history', JSON.stringify(matchHistory))
}

function saveMatchToHistory() {
  // só salva se houve alguma pontuação
  if (setsA === 0 && setsB === 0 && pointsA === 0 && pointsB === 0) return

  // Determina vencedor para o histórico (Sets > Pontos)
  let winnerKey = 'A'
  if (setsB > setsA) {
    winnerKey = 'B'
  } else if (setsA === setsB && pointsB > pointsA) {
    winnerKey = 'B'
  }

  matchHistory.unshift({
    teamA: teamNames.A,
    teamB: teamNames.B,
    setsA,
    setsB,
    winner: winnerKey,
    date: new Date().toISOString()
  })

  saveHistory()
}

function openHistory() {
  renderHistory()
  openModal('historyModal')
}

function closeHistory() {
  closeModal('historyModal')
}

function renderHistory() {
  const list = document.getElementById('historyList')
  list.innerHTML = ''

  if (matchHistory.length === 0) {
    list.innerHTML = `
      <p class="text-center text-sm opacity-50">
        Nenhuma partida registrada
      </p>
    `
    return
  }

  matchHistory.forEach(match => {
    const date = new Date(match.date)
    const formatted = date.toLocaleString()

    const winnerColor =
      match.winner === 'A' ? 'text-primary' : 'text-accent-orange'

    list.innerHTML += `
      <div class="bg-white/5 rounded-xl p-3 space-y-1">
        <div class="flex justify-between text-sm font-bold">
          <span class="${winnerColor}">
            ${match.winner === 'A' ? match.teamA : match.teamB}
          </span>
          <span class="opacity-60">
            ${match.setsA} x ${match.setsB}
          </span>
        </div>

        <div class="text-xs opacity-50">
          ${match.teamA} x ${match.teamB}
        </div>

        <div class="text-[10px] opacity-40">
          ${formatted}
        </div>
      </div>
    `
  })
}

function confirmClearHistory() {
  matchHistory = []
  localStorage.removeItem('bt-history')
  renderHistory()
  closeClearHistoryModal()
}

function openClearHistoryModal() {
  openModal('clearHistoryModal')
}

function closeClearHistoryModal() {
  closeModal('clearHistoryModal')
}

function openModal(id) {
  const modal = document.getElementById(id)
  if (!modal) return

  // evita abrir o mesmo modal duas vezes
  if (modalStack.includes(id)) return

  modalStack.push(id)

  modal.style.zIndex = 1000 + modalStack.length * 10

  modal.classList.remove('hidden')
  modal.classList.add('flex', 'modal-enter')

  requestAnimationFrame(() => {
    modal.classList.add('modal-enter-active')
    modal.classList.remove('modal-enter')
  })

  updateBodyScroll()
}

function closeModal(id) {
  const modal = document.getElementById(id)
  if (!modal) return

  // só fecha se for o modal do topo
  if (modalStack[modalStack.length - 1] !== id) return

  modalStack.pop()

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

function updateBodyScroll() {
  if (modalStack.length > 0) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const pointsAEl = document.getElementById('pointsA')
const pointsBEl = document.getElementById('pointsB')
const setsAEl = document.getElementById('setsA')
const setsBEl = document.getElementById('setsB')
const cardA = document.getElementById('cardA')
const cardB = document.getElementById('cardB')

loadSettings()
load()
loadTeamNames()
loadHistory()
updateTeamNamesUI()
setupTeamNameEditing()
setupTeamNameInputs()

let deferredPrompt = null

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault()
  deferredPrompt = e

  // não mostrar se já foi fechado antes
  if (!localStorage.getItem('bt-install-dismissed')) {
    showInstallPrompt()
  }
})

function showInstallPrompt() {
  if (localStorage.getItem('bt-install-dismissed')) return

  const el = document.getElementById('installPrompt')
  el.classList.remove('hidden')

  el.classList.add('install-enter')
  requestAnimationFrame(() => {
    el.classList.add('install-enter-active')
    el.classList.remove('install-enter')
  })
}

function hideInstallPrompt() {
  const el = document.getElementById('installPrompt')
  if (!el) return

  el.classList.add('install-exit')
  requestAnimationFrame(() => {
    el.classList.add('install-exit-active')
    el.classList.remove('install-exit')
  })

  setTimeout(() => {
    el.classList.add('hidden')
    el.classList.remove('install-exit-active')
  }, 250)
}

async function installApp() {
  if (!deferredPrompt) return

  deferredPrompt.prompt()
  const result = await deferredPrompt.userChoice

  deferredPrompt = null
  hideInstallPrompt()

  // se recusou, não insistir
  if (result.outcome === 'dismissed') {
    localStorage.setItem('bt-install-dismissed', '1')
  }
}

if (
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true
) {
  const el = document.getElementById('installPrompt')
  if (el) el.remove()
}

const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
const isInStandalone = window.navigator.standalone === true

if (isIOS && !isInStandalone && !localStorage.getItem('bt-install-dismissed')) {
  const prompt = document.getElementById('installPrompt')
  if (prompt) {
    prompt.querySelector('button').style.display = 'none'
    prompt.querySelector('p:nth-child(2)').textContent =
      'No iPhone: compartilhar → Adicionar à Tela de Início'
    showInstallPrompt()
  }
}

function dismissInstallPrompt() {
  localStorage.setItem('bt-install-dismissed', '1')
  hideInstallPrompt()
  deferredPrompt = null
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./service-worker.js')
      .catch(err => console.error('SW erro:', err))
  })
}

navigator.serviceWorker?.addEventListener('controllerchange', () => {
  window.location.reload()
})
