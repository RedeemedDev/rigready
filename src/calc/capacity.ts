import type {
  CapacityInput,
  CapacityResult,
  LegResult,
  SlingConfig,
} from './types'

function legCountFor(config: SlingConfig): number {
  switch (config) {
    case 'single':
      return 1
    case 'double':
      return 2
    case 'bridle_2':
      return 2
    case 'bridle_3':
      return 3
    case 'bridle_4':
      return 4
    case 'basket':
      // Two parts of sling supporting (MVP)
      return 2
  }
}

/**
 * Equal-share bridle/basket tension.
 * angleFromVerticalDeg: 0 = vertical. Tension rises as angle opens.
 * tensionPerLeg = load / (legs * cos(θ))
 */
export function tensionPerLeg(
  loadWeight: number,
  legCount: number,
  angleFromVerticalDeg: number,
): number {
  if (loadWeight < 0) throw new Error('loadWeight must be >= 0')
  if (legCount < 1) throw new Error('legCount must be >= 1')
  if (angleFromVerticalDeg < 0 || angleFromVerticalDeg >= 90) {
    throw new Error('angleFromVerticalDeg must be in [0, 90)')
  }

  const cos = Math.cos((angleFromVerticalDeg * Math.PI) / 180)
  // Guard tiny cos near 90°
  if (cos <= 1e-6) throw new Error('angle too close to horizontal')

  return loadWeight / (legCount * cos)
}

/** Max load that keeps each leg at or under WLL (equal share). */
export function maxLiftWeight(
  wll: number,
  legCount: number,
  angleFromVerticalDeg: number,
): number {
  if (wll <= 0) throw new Error('wll must be > 0')
  const cos = Math.cos((angleFromVerticalDeg * Math.PI) / 180)
  if (cos <= 1e-6) throw new Error('angle too close to horizontal')
  return wll * legCount * cos
}

const ASSUMPTIONS = [
  'Equal load share / COG under hook',
  'angle is degrees from vertical (0 = vertical)',
  'WLL is user-entered for the hitch in use (no invented derates)',
  'basket counted as 2 supporting parts',
  'planning aid only — verify manufacturer data & ASME B30 / site rules',
]

export function calculateCapacity(input: CapacityInput): CapacityResult {
  const legCount = legCountFor(input.config)
  const { wll, angleFromVerticalDeg, unit, mode } = input

  if (!(wll > 0)) throw new Error('wll must be > 0')

  if (mode === 'max_lift') {
    const maxLoad = maxLiftWeight(wll, legCount, angleFromVerticalDeg)
    const tension = tensionPerLeg(maxLoad, legCount, angleFromVerticalDeg)
    const legs: LegResult[] = Array.from({ length: legCount }, (_, i) => ({
      legIndex: i + 1,
      tension,
      availableWll: wll,
      margin: wll - tension,
      pass: true,
      minWllRequired: tension,
    }))

    return {
      mode,
      unit,
      legCount,
      tensionPerLeg: tension,
      legs,
      overallPass: true,
      loadWeight: maxLoad,
      maxLiftWeight: maxLoad,
      minWllRequired: tension,
      assumptions: ASSUMPTIONS,
    }
  }

  // check_load
  const loadWeight = input.loadWeight
  if (loadWeight === undefined || Number.isNaN(loadWeight)) {
    throw new Error('loadWeight is required for check_load')
  }
  if (loadWeight < 0) throw new Error('loadWeight must be >= 0')

  const tension = tensionPerLeg(loadWeight, legCount, angleFromVerticalDeg)
  const minWllRequired = tension
  const margin = wll - tension
  const pass = margin >= 0

  const legs: LegResult[] = Array.from({ length: legCount }, (_, i) => ({
    legIndex: i + 1,
    tension,
    availableWll: wll,
    margin,
    pass,
    minWllRequired,
  }))

  return {
    mode,
    unit,
    legCount,
    tensionPerLeg: tension,
    legs,
    overallPass: pass,
    loadWeight,
    maxLiftWeight: maxLiftWeight(wll, legCount, angleFromVerticalDeg),
    minWllRequired,
    assumptions: ASSUMPTIONS,
  }
}