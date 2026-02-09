export const state = {
  settings: {
    scoringMode: 'simplified',
    setsEnabled: false,
    setsToWin: 3
  },
  matchHistory: [],
  teamNames: {
    A: 'Time A',
    B: 'Time B'
  },
  score: {
    pointsA: 0,
    pointsB: 0,
    setsA: 0,
    setsB: 0
  },
  modalStack: [],
  deferredPrompt: null,
  lastTouchEnd: 0
}
