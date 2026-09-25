import { save, STORAGE_KEYS } from '../lib/storage'
import { history } from './history.svelte'
import { match } from './match.svelte'
import { settings } from './settings.svelte'
import { teams } from './teams.svelte'

/** Salva no localStorage sempre que o estado muda. */
export function persistState() {
  $effect.root(() => {
    $effect(() => save(STORAGE_KEYS.settings, $state.snapshot(settings)))
    $effect(() => save(STORAGE_KEYS.score, $state.snapshot(match.score)))
    $effect(() => save(STORAGE_KEYS.history, $state.snapshot(history.matches)))
    $effect(() =>
      save(STORAGE_KEYS.teams, {
        presets: $state.snapshot(teams.presets),
        selection: $state.snapshot(teams.selection)
      })
    )
  })
}
