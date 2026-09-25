import { loadHistory } from '../lib/storage'
import type { MatchRecord } from '../lib/types'

class HistoryStore {
  matches: MatchRecord[] = $state(loadHistory())

  add(match: MatchRecord) {
    this.matches.unshift(match)
  }

  clear() {
    this.matches = []
  }
}

export const history = new HistoryStore()
