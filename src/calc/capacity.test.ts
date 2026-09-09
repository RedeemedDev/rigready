import { describe, expect, test } from 'vitest'
import {
  calculateCapacity,
  maxLiftWeight,
  tensionPerLeg,
} from './capacity'

describe('tensionPerLeg', () => {
  test('vertical 2-leg splits load in half', () => {
    expect(tensionPerLeg(4000, 2, 0)).toBeCloseTo(2000)
  })

  test('60° from vertical increases tension', () => {
    // 4000 / (2 * cos60) = 4000 / (2 * 0.5) = 4000
    expect(tensionPerLeg(4000, 2, 60)).toBeCloseTo(4000)
  })
})

describe('maxLiftWeight', () => {
  test('inverts tension formula at 60°', () => {
    // wll 2000, 2 legs, 60° → 2000 * 2 * 0.5 = 2000
    expect(maxLiftWeight(2000, 2, 60)).toBeCloseTo(2000)
  })
})

describe('calculateCapacity', () => {
  test('check_load FAIL shows min WLL required', () => {
    const result = calculateCapacity({
      mode: 'check_load',
      loadWeight: 4000,
      wll: 2000,
      config: 'bridle_2',
      hitch: 'choker',
      angleFromVerticalDeg: 60,
      unit: 'lb',
    })

    expect(result.overallPass).toBe(false)
    expect(result.tensionPerLeg).toBeCloseTo(4000)
    expect(result.minWllRequired).toBeCloseTo(4000)
  })

  test('check_load PASS when WLL covers tension', () => {
    const result = calculateCapacity({
      mode: 'check_load',
      loadWeight: 4000,
      wll: 4500,
      config: 'bridle_2',
      hitch: 'vertical',
      angleFromVerticalDeg: 60,
      unit: 'lb',
    })

    expect(result.overallPass).toBe(true)
    expect(result.legs[0]?.margin).toBeCloseTo(500)
  })

  test('max_lift returns max safe load', () => {
    const result = calculateCapacity({
      mode: 'max_lift',
      wll: 2000,
      config: 'bridle_2',
      hitch: 'vertical',
      angleFromVerticalDeg: 60,
      unit: 'lb',
    })

    expect(result.maxLiftWeight).toBeCloseTo(2000)
    expect(result.overallPass).toBe(true)
  })

  test('basket uses 2 supporting parts', () => {
    const result = calculateCapacity({
      mode: 'check_load',
      loadWeight: 4000,
      wll: 2500,
      config: 'basket',
      hitch: 'basket',
      angleFromVerticalDeg: 0,
      unit: 'lb',
    })

    expect(result.legCount).toBe(2)
    expect(result.tensionPerLeg).toBeCloseTo(2000)
    expect(result.overallPass).toBe(true)
  })
})