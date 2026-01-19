let settings = {
  scoringMode: 'simplified', // "official" | "simplified"
  setsToWin: 3
}

let pointsA = 0,
  pointsB = 0,
  setsA = 0,
  setsB = 0

function loadSettings() {
  const s = localStorage.getItem('bt-settings')
  if (s) settings = JSON.parse(s)
  document.getElementById('scoringMode').value = settings.scoringMode
  document.getElementById('setsToWin').value = settings.setsToWin
}

function saveSettings() {
  localStorage.setItem('bt-settings', JSON.stringify(settings))
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
  if (setsA === settings.setsToWin || setsB === settings.setsToWin) {
    const winner = setsA > setsB ? 'Time A' : 'Time B'
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

const pointsAEl = document.getElementById('pointsA')
const pointsBEl = document.getElementById('pointsB')
const setsAEl = document.getElementById('setsA')
const setsBEl = document.getElementById('setsB')
const cardA = document.getElementById('cardA')
const cardB = document.getElementById('cardB')

load()
loadSettings()
