import { describe, expect, it } from 'vitest'
import {
  generateChakraArchetypeResult,
  normalizeChakraScore
} from './chakra-archetypes'

describe('脉轮原型回归', () => {
  it('固定分数得到固定的主导、辅助、最低轮和原型代码', () => {
    const result = generateChakraArchetypeResult({
      海底轮: -100,
      脐轮: -50,
      太阳轮: 0,
      心轮: 25,
      喉轮: 75,
      眉心轮: 100,
      顶轮: 50
    })

    expect({
      primary: result.primary.name,
      secondary: result.secondary.name,
      lowest: result.lowest.name,
      code: result.archetype.code,
      gap: result.gap,
      average: result.average
    }).toEqual({
      primary: '眉心轮',
      secondary: '喉轮',
      lowest: '海底轮',
      code: 'ThirdEye-Throat',
      gap: 100,
      average: 57
    })
  })

  it('七轮同分时继续按固定轮序决定原型', () => {
    const result = generateChakraArchetypeResult({
      海底轮: 0,
      脐轮: 0,
      太阳轮: 0,
      心轮: 0,
      喉轮: 0,
      眉心轮: 0,
      顶轮: 0
    })

    expect({
      primary: result.primary.name,
      secondary: result.secondary.name,
      lowest: result.lowest.name,
      code: result.archetype.code
    }).toEqual({
      primary: '海底轮',
      secondary: '脐轮',
      lowest: '顶轮',
      code: 'Root-Sacral'
    })
  })

  it('归一化后的分数始终位于 0 到 100', () => {
    expect([
      normalizeChakraScore(-180),
      normalizeChakraScore(-100),
      normalizeChakraScore(0),
      normalizeChakraScore(100),
      normalizeChakraScore(180)
    ]).toEqual([0, 0, 50, 100, 100])
  })
})
