let settings = {
  scoringMode: 'simplified',
  setsEnabled: false, // 🔴 padrão: infinito
  setsToWin: 3
}

let teamNames = {
  A: 'Time A',
  B: 'Time B'
}

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
  const modal = document.getElementById('settingsModal')
  modal.classList.remove('hidden')
  modal.classList.add('flex')
}

function closeSettings() {
  const modal = document.getElementById('settingsModal')
  modal.classList.add('hidden')
  modal.classList.remove('flex')
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
    const winner = setsA > setsB ? teamNames.A : teamNames.B
    showWinner(winner)
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

function resetGame() {
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

function showWinner(team) {
  const modal = document.getElementById('winnerModal')
  document.getElementById('winnerText').textContent =
    team + ' venceu a partida!'
  modal.classList.remove('hidden')
  modal.classList.add('flex')
}

function closeWinner() {
  const modal = document.getElementById('winnerModal')
  modal.classList.add('hidden')
  modal.classList.remove('flex')
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

const pointsAEl = document.getElementById('pointsA')
const pointsBEl = document.getElementById('pointsB')
const setsAEl = document.getElementById('setsA')
const setsBEl = document.getElementById('setsB')
const cardA = document.getElementById('cardA')
const cardB = document.getElementById('cardB')

loadSettings()
load()
loadTeamNames()
updateTeamNamesUI()
setupTeamNameEditing()
