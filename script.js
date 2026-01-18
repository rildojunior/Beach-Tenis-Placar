let pointsA = 0
let pointsB = 0
let setsA = 0
let setsB = 0

let lastClickTime = 0
const CLICK_DELAY = 500 // ms

function safeClick(action) {
  const now = Date.now()
  if (now - lastClickTime < CLICK_DELAY) return
  lastClickTime = now
  action()
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
  saveGame()
  updateScreen()
}

function removePoint(team) {
  if (team === 'A' && pointsA > 0) pointsA--
  if (team === 'B' && pointsB > 0) pointsB--
  saveGame()
  updateScreen()
}

function resetPoints() {
  pointsA = 0
  pointsB = 0
}

function resetGame() {
  pointsA = 0
  pointsB = 0
  setsA = 0
  setsB = 0
  saveGame()
  updateScreen()
}

function updateScreen() {
  document.getElementById('pointsA').innerText = pointsA
  document.getElementById('pointsB').innerText = pointsB
  document.getElementById('setsA').innerText = setsA
  document.getElementById('setsB').innerText = setsB
}

function saveGame() {
  localStorage.setItem(
    'beachTennisScore',
    JSON.stringify({
      pointsA,
      pointsB,
      setsA,
      setsB
    })
  )
}

function loadGame() {
  const data = localStorage.getItem('beachTennisScore')
  if (!data) return
  const game = JSON.parse(data)
  pointsA = game.pointsA
  pointsB = game.pointsB
  setsA = game.setsA
  setsB = game.setsB
  updateScreen()
}

loadGame()
