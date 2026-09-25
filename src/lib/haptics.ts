/**
 * Vibração curta nos momentos que importam (fim de game e de set).
 * Funciona em Android; o Safari do iPhone não expõe vibração para sites.
 */
function vibrate(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator)
    navigator.vibrate(pattern)
}

export const haptics = {
  game: () => vibrate(18),
  set: () => vibrate([22, 60, 22, 60, 40])
}
