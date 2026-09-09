import { useMemo, useState } from 'react'
import { calculateCapacity } from './calc/capacity'
import { LiftDiagram } from './LiftDiagram'
import type {
  CapacityMode,
  Hitch,
  SlingConfig,
  Unit,
} from './calc/types'

const CONFIGS: { value: SlingConfig; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Double' },
  { value: 'bridle_2', label: '2-leg bridle' },
  { value: 'bridle_3', label: '3-leg bridle' },
  { value: 'bridle_4', label: '4-leg bridle' },
  { value: 'basket', label: 'Basket' },
]

const HITCHES: { value: Hitch; label: string }[] = [
  { value: 'vertical', label: 'Vertical' },
  { value: 'choker', label: 'Choker' },
  { value: 'basket', label: 'Basket' },
]

function formatNum(n: number, unit: Unit) {
  return `${Math.round(n).toLocaleString()} ${unit}`
}

export function CapacityScreen() {
  const [unit, setUnit] = useState<Unit>('lb')
  const [mode, setMode] = useState<CapacityMode>('check_load')
  const [loadWeight, setLoadWeight] = useState('4000')
  const [wll, setWll] = useState('2000')
  const [config, setConfig] = useState<SlingConfig>('bridle_2')
  const [hitch, setHitch] = useState<Hitch>('choker')
  const [angle, setAngle] = useState('60')

  const result = useMemo(() => {
    const wllN = Number(wll)
    const angleN = Number(angle)
    const loadN = Number(loadWeight)
    if (!(wllN > 0) || Number.isNaN(angleN)) return null
    try {
      return calculateCapacity({
        mode,
        loadWeight: mode === 'check_load' ? loadN : undefined,
        wll: wllN,
        config,
        hitch,
        angleFromVerticalDeg: angleN,
        unit,
      })
    } catch {
      return null
    }
  }, [mode, loadWeight, wll, config, hitch, angle, unit])

  return (
    <div className="screen">
      <header className="topbar">
        <h1>RigReady</h1>
        <div className="unit-toggle" role="group" aria-label="Units">
          <button
            type="button"
            className={unit === 'lb' ? 'active' : ''}
            onClick={() => setUnit('lb')}
          >
            lb
          </button>
          <button
            type="button"
            className={unit === 'kg' ? 'active' : ''}
            onClick={() => setUnit('kg')}
          >
            kg
          </button>
        </div>
      </header>

      <div className="mode-pills">
        <button type="button" className="pill active">
          Capacity check
        </button>
        <button type="button" className="pill soon" disabled>
          Height / length <span>soon</span>
        </button>
      </div>

      <div className="mode-switch">
        <button
          type="button"
          className={mode === 'check_load' ? 'active' : ''}
          onClick={() => setMode('check_load')}
        >
          Check load
        </button>
        <button
          type="button"
          className={mode === 'max_lift' ? 'active' : ''}
          onClick={() => setMode('max_lift')}
        >
          Max lift
        </button>
      </div>

            <section className="card diagram">
        <LiftDiagram
          config={config}
          angleFromVerticalDeg={Number(angle) || 0}
        />
      </section>

      <section className="card fields">
        {mode === 'check_load' && (
          <label>
            Load weight ({unit})
            <input
              inputMode="decimal"
              value={loadWeight}
              onChange={(e) => setLoadWeight(e.target.value)}
            />
          </label>
        )}

        <label>
          WLL per sling ({unit})
          <input
            inputMode="decimal"
            value={wll}
            onChange={(e) => setWll(e.target.value)}
          />
          <span className="hint">You enter rating — we never invent it</span>
        </label>

        <label>
          Config
          <select
            value={config}
            onChange={(e) => setConfig(e.target.value as SlingConfig)}
          >
            {CONFIGS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Hitch
          <select
            value={hitch}
            onChange={(e) => setHitch(e.target.value as Hitch)}
          >
            {HITCHES.map((h) => (
              <option key={h.value} value={h.value}>
                {h.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Angle from vertical (°)
          <input
            inputMode="decimal"
            value={angle}
            onChange={(e) => setAngle(e.target.value)}
          />
        </label>
      </section>

      {result && (
        <section
          className={`card results ${result.overallPass ? 'pass' : 'fail'}`}
        >
          {mode === 'check_load' ? (
            <>
              <div className="badge">
                {result.overallPass ? 'PASS' : 'FAIL'}
              </div>
              <p>Tension per leg: {formatNum(result.tensionPerLeg, unit)}</p>
              <p>Available WLL: {formatNum(Number(wll), unit)}</p>
              <p>
                Margin:{' '}
                {formatNum(result.legs[0]?.margin ?? 0, unit)}
              </p>
              {!result.overallPass && (
                <p className="min-wll">
                  Minimum WLL required:{' '}
                  <strong>
                    {formatNum(result.minWllRequired, unit)} per sling
                  </strong>
                </p>
              )}
            </>
          ) : (
            <>
              <div className="badge pass-badge">MAX LIFT</div>
              <p className="max-lift">
                {formatNum(result.maxLiftWeight, unit)}
              </p>
              <p className="muted">
                Max load at this WLL, config, and angle (equal share)
              </p>
            </>
          )}
          <p className="hardware-note">
            All hardware in the lift path (shackles, hooks, etc.) must meet or
            exceed the governing tension / minimum WLL shown.
          </p>
        </section>
      )}

      <p className="disclaimer">
        Planning aid only. Verify manufacturer data &amp; ASME B30 / site
        rules. Assumes even load share / COG under the hook.
      </p>
    </div>
  )
}