export type Unit = 'lb' | 'kg'

export type SlingType = 'chain' | 'wire' | 'synthetic'

export type Hitch = 'vertical' | 'choker' | 'basket'

/** Legs sharing the load equally in MVP */
export type SlingConfig =
  | 'single'
  | 'double'
  | 'bridle_2'
  | 'bridle_3'
  | 'bridle_4'
  | 'basket'

export type CapacityMode = 'check_load' | 'max_lift'

export interface CapacityInput {
  mode: CapacityMode
  /** Required for check_load; ignored for max_lift */
  loadWeight?: number
  /** User-entered WLL per sling (or per leg rating you are using) — never invented */
  wll: number
  config: SlingConfig
  hitch: Hitch
  /** Degrees from vertical; 0 = vertical */
  angleFromVerticalDeg: number
  unit: Unit
}

export interface LegResult {
  legIndex: number
  tension: number
  availableWll: number
  margin: number
  pass: boolean
  /** If fail: min WLL needed on this leg for this lift share */
  minWllRequired: number
}

export interface CapacityResult {
  mode: CapacityMode
  unit: Unit
  legCount: number
  tensionPerLeg: number
  legs: LegResult[]
  overallPass: boolean
  /** check_load: echo load; max_lift: computed max safe load */
  loadWeight: number
  maxLiftWeight: number
  /** Governing min WLL if any leg fails (check_load) */
  minWllRequired: number
  assumptions: string[]
}