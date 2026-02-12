export const state = {
  settings: {
    scoringMode: 'simplified',
    setsEnabled: false,
    setsToWin: 3
  },
  matchHistory: [],
  teamPresets: [
    { id: 'default-a', name: 'Time A', locked: true },
    { id: 'default-b', name: 'Time B', locked: true }
  ],
  teamSelection: {
    A: 'default-a',
    B: 'default-b'
  },
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
  lastTouchEnd: 0,
  activeTeamPicker: null
}
