import { describe, expect, it } from 'vitest'
import { calculateAllChakraScores } from './chakra-data'

const 中间项答案 = Object.fromEntries(
  Array.from({ length: 56 }, (_, index) => [index + 1, 2]),
)

describe('脉轮计分回归', () => {
  it('保持 56 题全选中间项时的七轮计分结果', () => {
    expect(calculateAllChakraScores(中间项答案)).toEqual({
      海底轮: 0,
      太阳轮: 0,
      脐轮: 0,
      心轮: 0,
      喉轮: 0,
      眉心轮: 0,
      顶轮: 0
    })
  })

  it('按题目 scores 数组计算反向题', () => {
    expect(calculateAllChakraScores({ 2: 0, 3: 0 })).toEqual({
      海底轮: 25,
      太阳轮: 0,
      脐轮: 0,
      心轮: 0,
      喉轮: 0,
      眉心轮: 0,
      顶轮: 0
    })
  })

  it('省略版本等价于 V1，V2 只给海底轮增加 20 分', () => {
    const 反向题得分答案 = { ...中间项答案, 2: 0, 3: 0 }
    const 默认分数 = calculateAllChakraScores(反向题得分答案)
    const v1分数 = calculateAllChakraScores(反向题得分答案, 'v1')
    const v2分数 = calculateAllChakraScores(反向题得分答案, 'v2')

    expect(默认分数).toEqual(v1分数)
    expect(v1分数.海底轮).toBe(25)
    expect(v2分数).toEqual({ ...v1分数, 海底轮: 45 })
    expect(calculateAllChakraScores(中间项答案, 'v2')).toEqual({
      ...calculateAllChakraScores(中间项答案, 'v1'),
      海底轮: 20,
    })
  })

  it('V2 在现有四舍五入之后加分并封顶至 100', () => {
    const 边界答案 = { 1: 4, 2: 0, 3: 1, 4: 4, 5: 4, 6: 2, 7: 4, 8: 4 }

    expect(calculateAllChakraScores(边界答案).海底轮).toBe(81)
    expect(calculateAllChakraScores(边界答案, 'v2').海底轮).toBe(100)
  })

  it.each([
    ['正向满分', { 1: 4, 2: 0, 3: 0, 4: 4, 5: 4, 6: 0, 7: 4, 8: 4 }, 100, 100],
    ['反向满分', { 1: 0, 2: 4, 3: 4, 4: 0, 5: 0, 6: 4, 7: 0, 8: 0 }, -100, -80],
  ] as const)('%s保持 V1 边界并应用 V2 规则', (_name, answers, v1Root, v2Root) => {
    expect(calculateAllChakraScores(answers).海底轮).toBe(v1Root)
    expect(calculateAllChakraScores(answers, 'v2').海底轮).toBe(v2Root)
  })
})
