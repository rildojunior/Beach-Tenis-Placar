/**
 * Molas no estilo da Apple: em vez de massa/rigidez/amortecimento, dois
 * parâmetros fáceis de ajustar.
 *
 * - `response`: quanto tempo (s) a mola leva para chegar perto do alvo. Menor = mais rápida.
 * - `damping`: 1 = sem balanço (criticamente amortecida); < 1 = passa do alvo e volta.
 *
 * A posição é calculada de forma analítica, então o movimento não depende do
 * frame rate e pode ser interrompido a qualquer momento, sem saltos.
 */

export interface SpringOptions {
  response: number
  damping: number
}

/** Padrão para quase tudo: suave e sem balanço. */
export const SPRING_DEFAULT: SpringOptions = { response: 0.4, damping: 1 }
/** Peças pequenas (números, interruptores): um pouco mais rápida. */
export const SPRING_SNAPPY: SpringOptions = { response: 0.28, damping: 1 }
/** Depois de um gesto com impulso (arrastar e soltar a folha): leve balanço. */
export const SPRING_MOMENTUM: SpringOptions = { response: 0.3, damping: 0.8 }

/**
 * Deslocamento em relação ao alvo após `t` segundos.
 * `x0` é o deslocamento inicial e `v0` a velocidade inicial (unidades/s).
 */
export function springDisplacement(
  { response, damping }: SpringOptions,
  x0: number,
  v0: number,
  t: number
): number {
  const w0 = (2 * Math.PI) / response

  if (damping < 1) {
    const wd = w0 * Math.sqrt(1 - damping * damping)
    const decay = Math.exp(-damping * w0 * t)
    return (
      decay * (x0 * Math.cos(wd * t) + ((v0 + damping * w0 * x0) / wd) * Math.sin(wd * t))
    )
  }

  if (damping === 1) {
    return Math.exp(-w0 * t) * (x0 + (v0 + w0 * x0) * t)
  }

  const root = Math.sqrt(damping * damping - 1)
  const r1 = -w0 * (damping - root)
  const r2 = -w0 * (damping + root)
  const c2 = (v0 - r1 * x0) / (r2 - r1)
  const c1 = x0 - c2
  return c1 * Math.exp(r1 * t) + c2 * Math.exp(r2 * t)
}

export function springVelocity(
  options: SpringOptions,
  x0: number,
  v0: number,
  t: number
): number {
  const dt = 1 / 1000
  return (
    (springDisplacement(options, x0, v0, t + dt) -
      springDisplacement(options, x0, v0, t)) /
    dt
  )
}

/** Tempo (s) até a mola ficar a menos de `epsilon` do alvo, partindo de 1. */
export function settleTime(options: SpringOptions, epsilon = 0.001): number {
  const step = 1 / 240
  let last = 0
  for (let t = 0; t < 5; t += step) {
    if (Math.abs(springDisplacement(options, 1, 0, t)) > epsilon) last = t
  }
  return last + step
}

/** Progresso de 0 a 1 ao longo do tempo normalizado `p` (0 a 1). */
export function springEasing(options: SpringOptions): {
  duration: number
  easing: (p: number) => number
} {
  const duration = settleTime(options)
  return {
    duration: Math.round(duration * 1000),
    easing: p => (p >= 1 ? 1 : 1 - springDisplacement(options, 1, 0, p * duration))
  }
}

/** A mesma curva em CSS, usando `linear()`, para transições feitas só com CSS. */
export function springCss(
  options: SpringOptions,
  samples = 48
): { duration: string; easing: string } {
  const { duration, easing } = springEasing(options)
  const points = Array.from({ length: samples + 1 }, (_, i) =>
    Number(easing(i / samples).toFixed(4))
  )
  return { duration: `${duration}ms`, easing: `linear(${points.join(', ')})` }
}

type Scheduler = {
  now: () => number
  request: (callback: () => void) => number
  cancel: (id: number) => void
}

const browserScheduler: Scheduler = {
  now: () => performance.now(),
  request: callback => requestAnimationFrame(callback),
  cancel: id => cancelAnimationFrame(id)
}

/**
 * Um valor animado por mola. Chamar `to()` durante uma animação muda o alvo
 * a partir da posição e velocidade atuais, então o movimento nunca "trava".
 */
export class SpringValue {
  value: number
  velocity = 0

  private target = 0
  private options = SPRING_DEFAULT
  private start = 0
  private x0 = 0
  private v0 = 0
  private frame: number | null = null
  private settle: ((reached: boolean) => void) | null = null

  constructor(
    initial: number,
    private onUpdate: (value: number) => void,
    private scheduler: Scheduler = browserScheduler
  ) {
    this.value = initial
    this.target = initial
  }

  get animating() {
    return this.frame !== null
  }

  /** Anima até `target`. Resolve `true` ao chegar, `false` se for interrompida. */
  to(target: number, options: SpringOptions = SPRING_DEFAULT): Promise<boolean> {
    this.sample()
    this.finish(false)

    this.target = target
    this.options = options
    this.x0 = this.value - target
    this.v0 = this.velocity
    this.start = this.scheduler.now()

    return new Promise(resolve => {
      this.settle = resolve
      this.frame = this.scheduler.request(this.tick)
    })
  }

  /** Vai direto para o valor, sem animação (ex.: seguindo o dedo). */
  jump(value: number) {
    this.stop()
    this.value = value
    this.velocity = 0
    this.onUpdate(value)
  }

  /** Para onde está, mantendo a posição atual na tela. */
  stop() {
    this.sample()
    this.finish(false)
  }

  private tick = () => {
    this.sample()
    const settled =
      Math.abs(this.value - this.target) < 0.5 && Math.abs(this.velocity) < 5
    if (settled) {
      this.value = this.target
      this.velocity = 0
      this.onUpdate(this.value)
      this.finish(true)
      return
    }
    this.onUpdate(this.value)
    this.frame = this.scheduler.request(this.tick)
  }

  private sample() {
    if (this.frame === null) return
    const t = (this.scheduler.now() - this.start) / 1000
    this.value = this.target + springDisplacement(this.options, this.x0, this.v0, t)
    this.velocity = springVelocity(this.options, this.x0, this.v0, t)
  }

  private finish(reached: boolean) {
    if (this.frame !== null) this.scheduler.cancel(this.frame)
    this.frame = null
    this.settle?.(reached)
    this.settle = null
  }
}
