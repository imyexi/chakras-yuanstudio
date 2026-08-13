import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ChakraScoreChart } from './chakra-score-chart'

describe('ChakraScoreChart', () => {
  it('把超界分数钳制在 -100 到 100，并让图形与读屏表格保持一致', () => {
    const { container } = render(
      <ChakraScoreChart
        scores={{ 海底轮: -180, 太阳轮: 240 }}
        primaryName="太阳轮"
        secondaryName="心轮"
        lowestName="海底轮"
      />
    )

    const bars = container.querySelectorAll<HTMLElement>('.chakra-score-track__bar')
    expect(bars[0]).toHaveStyle({ left: '0%', width: '50%' })
    expect(bars[1]).toHaveStyle({ left: '50%', width: '50%' })

    const rows = within(screen.getByRole('table', { name: '七轮原始分数与角色' }))
      .getAllByRole('row')
      .slice(1)
    expect(rows[0]).toHaveTextContent('海底轮-100%成长课题')
    expect(rows[1]).toHaveTextContent('太阳轮+100%主导能量')
  })
})
