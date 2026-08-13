import { chakras } from '@/lib/chakra-data'

const CHAKRA_THEME_COLORS = {
  1: 'var(--chakra-root)',
  2: 'var(--chakra-solar)',
  3: 'var(--chakra-sacral)',
  4: 'var(--chakra-heart)',
  5: 'var(--chakra-throat)',
  6: 'var(--chakra-third-eye)',
  7: 'var(--chakra-crown)',
} as const

type ChakraScoreChartProps = {
  scores: Record<string, number>
  primaryName: string
  secondaryName: string
  lowestName: string
}

function formatSignedScore(score: number) {
  const rounded = Math.round(score)
  return `${rounded > 0 ? '+' : ''}${rounded}%`
}

export function ChakraScoreChart({
  scores,
  primaryName,
  secondaryName,
  lowestName,
}: ChakraScoreChartProps): React.ReactNode {
  const rows = chakras.map((chakra) => {
    const score = Math.max(-100, Math.min(100, scores[chakra.name] ?? 0))
    const role = chakra.name === primaryName
      ? '主导能量'
      : chakra.name === secondaryName
        ? '辅助风格'
        : chakra.name === lowestName
          ? '成长课题'
          : '当前能量'
    const width = `${Math.abs(score) / 2}%`
    const left = score < 0 ? `${50 - Math.abs(score) / 2}%` : '50%'

    return { chakra, score, role, width, left }
  })

  return (
    <>
      <div data-testid="chakra-score-chart" aria-hidden="true" className="chakra-score-chart">
        {rows.map(({ chakra, score, role, width, left }) => (
          <div className="chakra-score-row" key={chakra.name}>
            <div className="chakra-score-row__meta">
              <span>{chakra.name}</span>
              <span>{formatSignedScore(score)}</span>
              <span>{role}</span>
            </div>
            <div className="chakra-score-track">
              <span className="chakra-score-track__zero" />
              <span
                className="chakra-score-track__bar"
                style={{
                  backgroundColor: CHAKRA_THEME_COLORS[chakra.id as keyof typeof CHAKRA_THEME_COLORS],
                  left,
                  width,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <table className="sr-only" aria-label="七轮原始分数与角色">
        <thead>
          <tr>
            <th>脉轮</th>
            <th>原始分数</th>
            <th>角色</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ chakra, score, role }) => (
            <tr key={chakra.name}>
              <td>{chakra.name}</td>
              <td>{formatSignedScore(score)}</td>
              <td>{role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
