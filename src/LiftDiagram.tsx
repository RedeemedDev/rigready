import type { SlingConfig } from './calc/types'

function legCount(config: SlingConfig): number {
  switch (config) {
    case 'single':
      return 1
    case 'double':
    case 'bridle_2':
    case 'basket':
      return 2
    case 'bridle_3':
      return 3
    case 'bridle_4':
      return 4
  }
}

type Props = {
  config: SlingConfig
  angleFromVerticalDeg: number
}

export function LiftDiagram({ config, angleFromVerticalDeg }: Props) {
  const n = legCount(config)
  const hook = { x: 150, y: 28 }
  const slingTopY = hook.y + 18
  const loadW = 100
  const loadH = 56
  const loadX = 100
  const loadY = 155

  const picks = Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1)
    return {
      x: loadX + 12 + t * (loadW - 24),
      y: loadY,
    }
  })

  const angleLabel =
    Number.isFinite(angleFromVerticalDeg) && angleFromVerticalDeg >= 0
      ? `${Math.round(angleFromVerticalDeg)}° from vertical`
      : ''

  return (
    <svg
      className="lift-diagram"
      viewBox="0 0 300 250"
      role="img"
      aria-label={`Lift diagram, ${n} leg(s), ${angleLabel}`}
    >
      {/* Hook */}
      <circle cx={hook.x} cy={hook.y} r="8" fill="#ccc" />
      <path
        d={`M ${hook.x - 10} ${hook.y + 6} Q ${hook.x} ${hook.y + 22} ${hook.x + 10} ${hook.y + 6}`}
        fill="none"
        stroke="#ccc"
        strokeWidth="3"
      />

      {/* Legs first (under labels) */}
      {picks.map((p, i) => (
        <line
          key={`line-${i}`}
          x1={hook.x}
          y1={slingTopY}
          x2={p.x}
          y2={p.y}
          stroke="#e65100"
          strokeWidth="4"
          strokeLinecap="round"
        />
      ))}

      {/* Leg labels near each pick point, outside the load */}
            {picks.map((p, i) => {
        // 4-leg: park each label above its own pick, alternate height so neighbors don't collide
        if (n >= 4) {
          const stagger = i % 2 === 0 ? 18 : 4
          return (
            <text
              key={`label-${i}`}
              x={p.x}
              y={loadY - stagger}
              fill="#ffcc99"
              fontSize="11"
              fontWeight="700"
              textAnchor="middle"
            >
              Leg {i + 1}
            </text>
          )
        }

        // 1–3 legs: same side-offset as your good version
        const outward = p.x < hook.x ? -1 : p.x > hook.x ? 1 : 0
        const labelX = p.x + outward * 22
        const labelY = p.y - 10
        return (
          <text
            key={`label-${i}`}
            x={labelX}
            y={labelY}
            fill="#ffcc99"
            fontSize="12"
            fontWeight="700"
            textAnchor={outward < 0 ? 'end' : outward > 0 ? 'start' : 'middle'}
          >
            Leg {i + 1}
          </text>
        )
      })}

      {/* Load */}
      <rect
        x={loadX}
        y={loadY}
        width={loadW}
        height={loadH}
        rx="6"
        fill="#3a3a3a"
        stroke="#888"
        strokeWidth="2"
      />
      <text
        x="150"
        y={loadY + 34}
        fill="#f5f5f5"
        fontSize="13"
        textAnchor="middle"
        fontWeight="700"
      >
        LOAD
      </text>

      {/* Angle + config caption below load — clear of slings */}
      <text
        x="150"
        y={loadY + loadH + 22}
        fill="#b0b0b0"
        fontSize="12"
        textAnchor="middle"
      >
        {angleLabel}
        {config === 'basket' ? ' · Basket (2 parts)' : ''}
      </text>
    </svg>
  )
}