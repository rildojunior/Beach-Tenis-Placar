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
  const exportBtn = document.getElementById('exportHistoryBtn')
  list.innerHTML = ''

  if (matchHistory.length === 0) {
    list.innerHTML = `
      <p class="text-center text-sm opacity-50">
        Nenhuma partida registrada
      </p>
    `
    if (exportBtn) exportBtn.disabled = true
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

  if (exportBtn) exportBtn.disabled = false
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

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Falha ao carregar imagem: ${src}`))
    img.src = src
  })
}

async function exportHistoryImage() {
  if (matchHistory.length === 0) return

  const canvas = document.getElementById('historyCanvas')
  if (!canvas) return

  const width = 1080
  const height = 1920
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#0f1115')
  gradient.addColorStop(1, '#1f232a')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  let logo = null
  try {
    logo = await loadImage('icon-192.png')
  } catch (err) {
    console.warn(err)
  }

  const headerCenterX = width / 2
  const headerTop = 60
  const logoSize = 84

  if (logo) {
    ctx.save()
    drawRoundedRect(
      ctx,
      headerCenterX - logoSize / 2,
      headerTop,
      logoSize,
      logoSize,
      20
    )
    ctx.clip()
    ctx.drawImage(
      logo,
      headerCenterX - logoSize / 2,
      headerTop,
      logoSize,
      logoSize
    )
    ctx.restore()
  }

  ctx.fillStyle = '#17cfcf'
  ctx.font = "700 40px 'Spline Sans', sans-serif"
  ctx.textAlign = 'center'
  ctx.fillText('BEACH TENNIS PLACAR', headerCenterX, headerTop + 120)

  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.font = "600 24px 'Spline Sans', sans-serif"
  const exportedAt = new Date().toLocaleString()
  ctx.fillText(exportedAt, headerCenterX, headerTop + 160)

  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(120, headerTop + 200)
  ctx.lineTo(width - 120, headerTop + 200)
  ctx.stroke()

  const maxItems = 8
  const items = matchHistory.slice(0, maxItems)
  const startY = 320
  const rowHeight = 190
  const drawRoundedRect = (ctx, x, y, w, h, r) => {
    const radius = Math.min(r, w / 2, h / 2)
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.arcTo(x + w, y, x + w, y + h, radius)
    ctx.arcTo(x + w, y + h, x, y + h, radius)
    ctx.arcTo(x, y + h, x, y, radius)
    ctx.arcTo(x, y, x + w, y, radius)
    ctx.closePath()
  }

  items.forEach((match, index) => {
    const y = startY + index * rowHeight
    const isTeamA = match.winner === 'A'
    const winnerName = isTeamA ? match.teamA : match.teamB
    const vsLine = `${match.teamA} x ${match.teamB}`
    const scoreLine = `${match.setsA} x ${match.setsB}`
    const dateLine = new Date(match.date).toLocaleString()

    const cardHeight = 150
    const cardTop = y - cardHeight / 2
    const line1Height = 44
    const line2Height = 34
    const line3Height = 28
    const blockHeight = line1Height + line2Height + line3Height
    const blockTop = cardTop + (cardHeight - blockHeight) / 2

    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    drawRoundedRect(ctx, 120, cardTop, width - 240, cardHeight, 22)
    ctx.fill()

    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.font = "700 36px 'Spline Sans', sans-serif"
    ctx.fillStyle = isTeamA ? '#17cfcf' : '#FC5D24'
    ctx.fillText(`🏆 ${winnerName}`, 160, blockTop)

    ctx.textAlign = 'right'
    ctx.font = "800 36px 'Spline Sans', sans-serif"
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.fillText(scoreLine, width - 160, blockTop)

    ctx.textAlign = 'left'
    ctx.font = "500 26px 'Spline Sans', sans-serif"
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.fillText(vsLine, 160, blockTop + line1Height)

    ctx.font = "500 22px 'Spline Sans', sans-serif"
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.fillText(dateLine, 160, blockTop + line1Height + line2Height)
  })

  ctx.textAlign = 'center'
  ctx.font = "600 22px 'Spline Sans', sans-serif"
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.fillText('Compartilhe seu histórico nas redes', width / 2, height - 80)

  canvas.toBlob(async blob => {
    if (!blob) return

    const file = new File([blob], 'historico-beach-tennis.png', {
      type: 'image/png'
    })

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Historico de Partidas',
          text: 'Meu historico de partidas no Beach Tennis Placar.'
        })
        return
      } catch (err) {
        console.error('Compartilhamento cancelado:', err)
      }
    }

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'historico-beach-tennis.png'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }, 'image/png')
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
