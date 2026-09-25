/**
 * Matemática de gestos das apresentações de design da Apple
 * ("Designing Fluid Interfaces", WWDC 2018).
 */

/**
 * Distância extra que um gesto percorreria com o impulso do dedo, como a
 * rolagem que continua depois de soltar. `decelerationRate` 0.998 = rolagem normal.
 */
export function project(velocity: number, decelerationRate = 0.998): number {
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate)
}

/**
 * Resistência progressiva ao passar do limite: quanto mais longe, menos o
 * elemento acompanha o dedo, em vez de parar de uma vez.
 */
export function rubberband(
  overshoot: number,
  dimension: number,
  constant = 0.55
): number {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot))
}

/** Calcula a velocidade do dedo (px/s) a partir dos últimos movimentos. */
export class VelocityTracker {
  private samples: { time: number; position: number }[] = []

  constructor(private window = 100) {}

  reset() {
    this.samples = []
  }

  add(time: number, position: number) {
    this.samples.push({ time, position })
    const cutoff = time - this.window
    while (this.samples.length > 2 && this.samples[0].time < cutoff) this.samples.shift()
  }

  velocity(): number {
    if (this.samples.length < 2) return 0
    const first = this.samples[0]
    const last = this.samples[this.samples.length - 1]
    const dt = last.time - first.time
    return dt > 0 ? ((last.position - first.position) / dt) * 1000 : 0
  }
}
