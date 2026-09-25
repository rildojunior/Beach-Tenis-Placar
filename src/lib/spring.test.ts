import { describe, expect, it } from 'vitest'
import {
  settleTime,
  springDisplacement,
  springEasing,
  SpringValue,
  SPRING_DEFAULT,
  SPRING_MOMENTUM
} from './spring'

const sampleMax = (fn: (t: number) => number) => {
  let max = -Infinity
  for (let t = 0; t < 2; t += 0.005) max = Math.max(max, fn(t))
  return max
}

describe('springDisplacement', () => {
  it('começa no deslocamento inicial e chega ao alvo', () => {
    expect(springDisplacement(SPRING_DEFAULT, 100, 0, 0)).toBeCloseTo(100)
    expect(Math.abs(springDisplacement(SPRING_DEFAULT, 100, 0, 2))).toBeLessThan(0.01)
  })

  it('criticamente amortecida não passa do alvo', () => {
    expect(
      sampleMax(t => -springDisplacement(SPRING_DEFAULT, 1, 0, t))
    ).toBeLessThanOrEqual(1e-9)
  })

  it('com damping < 1 passa do alvo e volta', () => {
    expect(sampleMax(t => -springDisplacement(SPRING_MOMENTUM, 1, 0, t))).toBeGreaterThan(
      0.01
    )
  })

  it('mantém a velocidade inicial recebida do gesto', () => {
    const dt = 0.0001
    const v = (springDisplacement(SPRING_DEFAULT, 0, 800, dt) - 0) / dt
    expect(v).toBeCloseTo(800, -1)
  })
})

describe('springEasing', () => {
  it('vai de 0 a 1', () => {
    const { easing, duration } = springEasing(SPRING_DEFAULT)
    expect(easing(0)).toBeCloseTo(0)
    expect(easing(1)).toBe(1)
    expect(duration).toBe(Math.round(settleTime(SPRING_DEFAULT) * 1000))
  })
})

describe('SpringValue', () => {
  function fakeClock() {
    let now = 0
    const queue = new Map<number, () => void>()
    let id = 0
    return {
      scheduler: {
        now: () => now,
        request: (cb: () => void) => (queue.set(++id, cb), id),
        cancel: (key: number) => void queue.delete(key)
      },
      advance(ms: number) {
        for (let i = 0; i < ms / 16; i++) {
          now += 16
          const pending = [...queue.values()]
          queue.clear()
          pending.forEach(cb => cb())
        }
      }
    }
  }

  it('chega ao alvo e resolve true', async () => {
    const clock = fakeClock()
    const values: number[] = []
    const spring = new SpringValue(0, v => values.push(v), clock.scheduler)
    const done = spring.to(100)
    clock.advance(2000)
    expect(await done).toBe(true)
    expect(spring.value).toBe(100)
  })

  it('ao mudar o alvo no meio, continua de onde está sem salto', async () => {
    const clock = fakeClock()
    const spring = new SpringValue(0, () => {}, clock.scheduler)
    const first = spring.to(100)
    clock.advance(100)
    const midway = spring.value
    const second = spring.to(0)
    expect(await first).toBe(false)
    expect(spring.value).toBeCloseTo(midway)
    expect(spring.velocity).toBeGreaterThan(0)
    clock.advance(2000)
    expect(await second).toBe(true)
    expect(spring.value).toBe(0)
  })
})
