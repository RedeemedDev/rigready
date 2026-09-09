import type { CapacityMode, Hitch, SlingConfig, Unit } from './calc/types'

export type Preset = {
  id: string
  name: string
  savedAt: string
  unit: Unit
  mode: CapacityMode
  loadWeight: string
  wll: string
  config: SlingConfig
  hitch: Hitch
  angle: string
}

const KEY = 'rigready.presets.v1'

export function loadPresets(): Preset[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Preset[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function savePresets(presets: Preset[]) {
  localStorage.setItem(KEY, JSON.stringify(presets))
}

export function newPresetId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}