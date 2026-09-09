import type { CapacityResult, Hitch, SlingConfig } from './calc/types'

type Props = {
  open: boolean
  onClose: () => void
  result: CapacityResult
  config: SlingConfig
  hitch: Hitch
  wll: number
}

const CONFIG_LABEL: Record<SlingConfig, string> = {
  single: 'Single',
  double: 'Double',
  bridle_2: '2-leg bridle',
  bridle_3: '3-leg bridle',
  bridle_4: '4-leg bridle',
  basket: 'Basket',
}

export function JobTicket({
  open,
  onClose,
  result,
  config,
  hitch,
  wll,
}: Props) {
  if (!open) return null

  const u = result.unit
  const when = new Date().toLocaleString()

    return (
    <div className="ticket-backdrop" role="dialog" aria-modal="true">
      <div className="ticket">
        <header className="ticket-header">
          <h2>RigReady · Job ticket</h2>
          <button
            type="button"
            className="ticket-close no-print"
            onClick={onClose}
          >
            Close
          </button>
        </header>

        <p className="ticket-meta">{when}</p>

        <div className="ticket-rows">
          <div className="ticket-row">
            <span>Mode</span>
            <strong>
              {result.mode === 'check_load' ? 'Check load' : 'Max lift'}
            </strong>
          </div>
          <div className="ticket-row">
            <span>Config</span>
            <strong>{CONFIG_LABEL[config]}</strong>
          </div>
          <div className="ticket-row">
            <span>Hitch</span>
            <strong>{hitch}</strong>
          </div>
          <div className="ticket-row">
            <span>Legs / parts</span>
            <strong>{result.legCount}</strong>
          </div>
          <div className="ticket-row">
            <span>WLL entered</span>
            <strong>
              {Math.round(wll).toLocaleString()} {u}
            </strong>
          </div>
          <div className="ticket-row">
            <span>Load</span>
            <strong>
              {Math.round(result.loadWeight).toLocaleString()} {u}
            </strong>
          </div>
          {result.mode === 'max_lift' && (
            <div className="ticket-row">
              <span>Max lift</span>
              <strong>
                {Math.round(result.maxLiftWeight).toLocaleString()} {u}
              </strong>
            </div>
          )}
          <div className="ticket-row">
            <span>Tension / leg</span>
            <strong>
              {Math.round(result.tensionPerLeg).toLocaleString()} {u}
            </strong>
          </div>
          <div className="ticket-row">
            <span>Result</span>
            <strong
              className={
                result.mode === 'max_lift'
                  ? ''
                  : result.overallPass
                    ? 'ok'
                    : 'bad'
              }
            >
              {result.mode === 'max_lift'
                ? 'MAX LIFT'
                : result.overallPass
                  ? 'PASS'
                  : 'FAIL'}
            </strong>
          </div>
          {!result.overallPass && result.mode === 'check_load' && (
            <div className="ticket-row">
              <span>Min WLL required</span>
              <strong>
                {Math.round(result.minWllRequired).toLocaleString()} {u} per
                sling
              </strong>
            </div>
          )}
        </div>

        <p className="ticket-note">
          All hardware in the lift path must meet or exceed the governing
          tension / minimum WLL. Ratings are user-entered — RigReady does not
          invent manufacturer data.
        </p>
        <p className="ticket-disclaimer">
          Planning aid only. Verify manufacturer data &amp; ASME B30 / site
          rules. Assumes even load share / COG under the hook.
        </p>

        <div className="ticket-actions no-print">
          <button type="button" onClick={() => window.print()}>
            Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  )
}