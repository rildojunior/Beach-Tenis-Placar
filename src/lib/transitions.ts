/**
 * Transições do Svelte que usam as mesmas molas de `spring.ts`.
 * Com "Reduzir movimento" ativo, viram um esmaecimento simples.
 */
import { prefersReducedMotion } from 'svelte/motion'
import type { TransitionConfig } from 'svelte/transition'
import { SPRING_DEFAULT, SPRING_SNAPPY, springEasing } from './spring'

const snappy = springEasing(SPRING_SNAPPY)
const soft = springEasing(SPRING_DEFAULT)

const crossfade = (duration = 180): TransitionConfig => ({
  duration,
  css: t => `opacity: ${t}`
})

/**
 * Número que rola na direção da mudança: sobe ao ganhar ponto, desce ao perder.
 * `leaving` marca o número que está saindo, que vai para o lado oposto.
 */
export function roll(
  _node: Element,
  { direction, leaving = false }: { direction: 1 | -1; leaving?: boolean }
): TransitionConfig {
  if (prefersReducedMotion.current) return crossfade(120)
  const sign = leaving ? -direction : direction
  return {
    ...snappy,
    css: (t, u) => `transform: translateY(${u * sign * 60}%); opacity: ${t}`
  }
}

/** Alerta "materializa": cresce levemente, ganha nitidez e aparece junto. */
export function alertIn(_node: Element): TransitionConfig {
  if (prefersReducedMotion.current) return crossfade()
  return {
    ...soft,
    css: (t, u) =>
      `opacity: ${t}; transform: scale(${1 + u * 0.1}); filter: blur(${u * 6}px)`
  }
}

/** Alerta sai só esmaecendo, como no iOS. */
export function alertOut(_node: Element): TransitionConfig {
  return crossfade(160)
}

/** Sobe da borda de baixo e volta pelo mesmo caminho. */
export function rise(_node: Element): TransitionConfig {
  if (prefersReducedMotion.current) return crossfade()
  return {
    ...soft,
    css: (t, u) => `opacity: ${t}; transform: translateY(${u * 140}%)`
  }
}
