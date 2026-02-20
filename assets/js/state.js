export const state = {
  settings: {
    scoringMode: 'official',
    gamesEnabled: false,
    gamesToWin: 3
  },
  matchHistory: [],
  teamPresets: [
    {
      id: 'default-a',
      name: 'Time A',
      locked: true,
      colors: {
        paletteId: 'cyan',
        primary: '#00C2FF'
      }
    },
    {
      id: 'default-b',
      name: 'Time B',
      locked: true,
      colors: {
        paletteId: 'orange',
        primary: '#FF7A00'
      }
    }
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
    gamesA: 0,
    gamesB: 0
  },
  modalStack: [],
  deferredPrompt: null,
  lastTouchEnd: 0,
  activeTeamPicker: null
}
