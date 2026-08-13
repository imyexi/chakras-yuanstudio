import { describe, expect, it } from 'vitest'
import { calculateAllChakraScores } from './chakra-data'

describe('脉轮计分回归', () => {
  it('保持 56 题全选中间项时的七轮计分结果', () => {
    const answers = Object.fromEntries(
      Array.from({ length: 56 }, (_, index) => [index + 1, 2])
    )

    expect(calculateAllChakraScores(answers)).toEqual({
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
})
