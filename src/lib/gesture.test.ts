import { describe, expect, it } from 'vitest'
import { project, rubberband, VelocityTracker } from './gesture'

describe('project', () => {
  it('projeta à frente na direção do movimento', () => {
    expect(project(1000)).toBeCloseTo(499)
    expect(project(-500)).toBeCloseTo(-249.5)
    expect(project(0)).toBe(0)
  })
})

describe('rubberband', () => {
  it('resiste cada vez mais, sem passar da dimensão', () => {
    const small = rubberband(50, 600)
    const large = rubberband(500, 600)
    expect(small).toBeLessThan(50)
    expect(large / 500).toBeLessThan(small / 50)
    expect(rubberband(1e6, 600)).toBeLessThan(600)
  })
})

describe('VelocityTracker', () => {
  it('mede px/s usando só os últimos 100ms', () => {
    const tracker = new VelocityTracker()
    tracker.add(0, 0)
    tracker.add(500, 0)
    tracker.add(550, 25)
    tracker.add(600, 50)
    expect(tracker.velocity()).toBeCloseTo(500)
  })
})
