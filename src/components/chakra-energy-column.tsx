'use client'

import * as React from 'react'

const CENTER_X = 120
const ROOT_Y = 250
const CROWN_Y = 30
const MANDALA_Y = 140

const CHAKRAS = ['root', 'sacral', 'solar', 'heart', 'throat', 'third-eye', 'crown'] as const

const STEP = (ROOT_Y - CROWN_Y) / (CHAKRAS.length - 1)

const CHAKRA_NODES =CHAKRAS.map((name, index) => ({
  name,
  index,
  cx: CENTER_X,
  cy: Number((ROOT_Y - index * STEP).toFixed(3)),
}))

function sideChannelPath(direction: 1 | -1) {
  let path = `M${CENTER_X} ${ROOT_Y}`

  for (let i = 0; i < CHAKRA_NODES.length - 1; i += 1) {
    const from = CHAKRA_NODES[i].cy
    const to = CHAKRA_NODES[i + 1].cy
    const side = i % 2 === 0 ? direction : -direction
    const swell = 24 + 20 * Math.sin((Math.PI * (i + 0.5)) / (CHAKRA_NODES.length - 1))
    const x = (CENTER_X + side * swell).toFixed(2)
    const c1 = (from - STEP * 0.15).toFixed(2)
    const c2 = (to + STEP * 0.15).toFixed(2)
    path += ` C${x} ${c1} ${x} ${c2} ${CENTER_X} ${to.toFixed(2)}`
  }

  return path
}

const IDA_PATH = sideChannelPath(-1)
const PINGALA_PATH = sideChannelPath(1)
const OUTER_PETALS = Array.from({ length: 12 }, (_, i) => i * 30)
const INNER_PETALS = Array.from({ length: 8 }, (_, i) => i * 45 + 22.5)

export function ChakraEnergyColumn() {
  const gradientId = `chakra-column-gradient-${React.useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const glowId = gradientId.replace('gradient', 'glow')
  const stroke = `url(#${gradientId})`

  return (
    <svg className="chakra-column" viewBox="0 0 240 280" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0" y1={ROOT_Y} x2="0" y2={CROWN_Y}>
          {CHAKRA_NODES.map((node) => (
            <stop
              key={node.name}
              className={`chakra-column__stop chakra-column__stop--${node.name}`}
              offset={node.index / (CHAKRA_NODES.length - 1)}
            />
          ))}
        </linearGradient>
        <radialGradient id={glowId}>
          <stop className="chakra-column__halo-stop" offset="0" stopOpacity="0.32" />
          <stop className="chakra-column__halo-stop" offset="1" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle className="chakra-column__halo" cx={CENTER_X} cy={MANDALA_Y} r="118" fill={`url(#${glowId})`} />

      <g className="chakra-column__mandala chakra-column__mandala--outer">
        <circle cx={CENTER_X} cy={MANDALA_Y} r="112" className="chakra-column__mandala-ring chakra-column__mandala-ring--dashed" />
        <circle cx={CENTER_X} cy={MANDALA_Y} r="104" className="chakra-column__mandala-ring" />
        {OUTER_PETALS.map((angle) => (
          <ellipse
            key={angle}
            className="chakra-column__petal"
            cx={CENTER_X}
            cy={MANDALA_Y - 66}
            rx="13"
            ry="36"
            transform={`rotate(${angle} ${CENTER_X} ${MANDALA_Y})`}
          />
        ))}
      </g>
      <g className="chakra-column__mandala chakra-column__mandala--inner">
        <circle cx={CENTER_X} cy={MANDALA_Y} r="58" className="chakra-column__mandala-ring" />
        {INNER_PETALS.map((angle) => (
          <ellipse
            key={angle}
            className="chakra-column__petal"
            cx={CENTER_X}
            cy={MANDALA_Y - 36}
            rx="9"
            ry="22"
            transform={`rotate(${angle} ${CENTER_X} ${MANDALA_Y})`}
          />
        ))}
      </g>

      <line
        className="chakra-column__axis"
        x1={CENTER_X}
        y1={ROOT_Y}
        x2={CENTER_X}
        y2={CROWN_Y}
        stroke={stroke}
        pathLength="1"
      />
      {[IDA_PATH, PINGALA_PATH].map((d, i) => (
        <g key={d} className={`chakra-column__channel chakra-column__channel--${i === 0 ? 'ida' : 'pingala'}`}>
          <path className="chakra-column__channel-line" d={d} stroke={stroke} pathLength="1" />
          <path className="chakra-column__channel-flow" d={d} stroke={stroke} pathLength="1" />
        </g>
      ))}

      {CHAKRA_NODES.map((node) => (
        <g
          key={node.name}
          className={`chakra-column__node chakra-column__node--${node.name}`}
          style={{ '--i': node.index } as React.CSSProperties}
        >
          <circle className="chakra-column__node-pulse" cx={node.cx} cy={node.cy} r="9" />
          <circle className="chakra-column__node-ring" cx={node.cx} cy={node.cy} r="8" />
          <circle className="chakra-column__node-core" cx={node.cx} cy={node.cy} r="3.6" />
        </g>
      ))}

      <circle className="chakra-column__spark" cx={CENTER_X} cy={ROOT_Y} r="2.6" />
    </svg>
  )
}
