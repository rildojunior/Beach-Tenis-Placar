let pointsA = 0,
  pointsB = 0,
  setsA = 0,
  setsB = 0

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
  pointsAEl.textContent = pointsA
  pointsBEl.textContent = pointsB
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

const pointsAEl = document.getElementById('pointsA')
const pointsBEl = document.getElementById('pointsB')
const setsAEl = document.getElementById('setsA')
const setsBEl = document.getElementById('setsB')
const cardA = document.getElementById('cardA')
const cardB = document.getElementById('cardB')

load()
