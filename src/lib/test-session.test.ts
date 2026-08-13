import {
  SESSION_STORAGE_KEYS,
  clearProgress,
  clearResult,
  findFirstMissingQuestion,
  restoreSession,
  sanitizeAnswers,
  sanitizeCurrentQuestion,
  sanitizeStoredResult,
  saveProgress,
  saveResult,
} from '@/lib/test-session'
import { describe, expect, it } from 'vitest'

const 完整分数 = {
  海底轮: -100,
  太阳轮: -50,
  脐轮: 0,
  心轮: 25,
  喉轮: 50,
  眉心轮: 75,
  顶轮: 100,
}

const 完整答案 = {
  1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 0, 7: 1, 8: 2, 9: 3, 10: 4,
  11: 0, 12: 1, 13: 2, 14: 3, 15: 4, 16: 0, 17: 1, 18: 2, 19: 3, 20: 4,
  21: 0, 22: 1, 23: 2, 24: 3, 25: 4, 26: 0, 27: 1, 28: 2, 29: 3, 30: 4,
  31: 0, 32: 1, 33: 2, 34: 3, 35: 4, 36: 0, 37: 1, 38: 2, 39: 3, 40: 4,
  41: 0, 42: 1, 43: 2, 44: 3, 45: 4, 46: 0, 47: 1, 48: 2, 49: 3, 50: 4,
  51: 0, 52: 1, 53: 2, 54: 3, 55: 4, 56: 0,
}

function 创建内存存储(初始值: Record<string, string> = {}) {
  const 数据 = { ...初始值 }
  return {
    数据,
    getItem: (键: string) => 数据[键] ?? null,
    setItem: (键: string, 值: string) => {
      数据[键] = 值
    },
    removeItem: (键: string) => {
      delete 数据[键]
    },
  }
}

describe('答题会话校验', () => {
  it('只保留普通对象中范围内的整数题号和选项', () => {
    expect(sanitizeAnswers({ 1: 0, 56: 4, 0: 2, 57: 3, '1.0': 1, '1.5': 1, 2: 5, 3: -1, 4: 1.2, 5: '2' }))
      .toEqual({ 1: 0, 56: 4 })
    expect(sanitizeAnswers([0, 1])).toEqual({})
    expect(sanitizeAnswers(null)).toEqual({})
    expect(sanitizeAnswers(new (class 答案 { 1 = 0 })())).toEqual({})
  })

  it('保留合法当前题号，损坏值按首个遗漏题回退', () => {
    expect(sanitizeCurrentQuestion(4, { 1: 0, 2: 1 })).toBe(4)
    expect(sanitizeCurrentQuestion(99, { 1: 0, 2: 1, 4: 3 })).toBe(2)
    expect(sanitizeCurrentQuestion('3', {})).toBe(0)
    expect(sanitizeCurrentQuestion(-1, 完整答案)).toBe(55)
  })

  it('只在空、稀疏、五题和完整答案时给出手工推导的首个遗漏题', () => {
    expect(findFirstMissingQuestion({})).toBe(1)
    expect(findFirstMissingQuestion({ 1: 0, 2: 1, 4: 2 })).toBe(3)
    expect(findFirstMissingQuestion({ 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 })).toBe(6)
    expect(findFirstMissingQuestion(完整答案)).toBeNull()
  })

  it('接受完整结果，清洗其中答案并忽略额外分数键', () => {
    expect(sanitizeStoredResult({
      scores: { ...完整分数, 额外轮: 88 },
      answers: { 1: 0, 2: 4, 57: 1, 3: 1.5 },
      completedAt: '2026-08-13T10:00:00.000Z',
    })).toEqual({
      scores: 完整分数,
      answers: { 1: 0, 2: 4 },
      completedAt: '2026-08-13T10:00:00.000Z',
    })
  })

  it('拒绝缺少轮、非有限值、越界值和非法完成时间的结果', () => {
    expect(sanitizeStoredResult({ scores: { ...完整分数, 顶轮: undefined }, answers: {}, completedAt: '2026-08-13T10:00:00.000Z' })).toBeNull()
    expect(sanitizeStoredResult({ scores: { ...完整分数, 心轮: Infinity }, answers: {}, completedAt: '2026-08-13T10:00:00.000Z' })).toBeNull()
    expect(sanitizeStoredResult({ scores: { ...完整分数, 喉轮: 101 }, answers: {}, completedAt: '2026-08-13T10:00:00.000Z' })).toBeNull()
    expect(sanitizeStoredResult({ scores: 完整分数, answers: {}, completedAt: '不是日期' })).toBeNull()
  })

  it('恢复五题进度并优先于旧结果', () => {
    const 存储 = 创建内存存储({
      [SESSION_STORAGE_KEYS.answers]: JSON.stringify({ 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 }),
      [SESSION_STORAGE_KEYS.currentQuestion]: '4',
      [SESSION_STORAGE_KEYS.result]: JSON.stringify({ scores: 完整分数, answers: 完整答案, completedAt: '2026-08-13T10:00:00.000Z' }),
    })
    expect(restoreSession(存储)).toEqual({ kind: 'progress', answers: { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 }, currentQuestion: 4 })
  })

  it('只接受规范整数文本作为已保存题号', () => {
    for (const 已保存题号 of ['', '   ', '1.0']) {
      const 存储 = 创建内存存储({
        [SESSION_STORAGE_KEYS.answers]: JSON.stringify({ 1: 0, 2: 1, 4: 2 }),
        [SESSION_STORAGE_KEYS.currentQuestion]: 已保存题号,
      })
      expect(restoreSession(存储)).toEqual({ kind: 'progress', answers: { 1: 0, 2: 1, 4: 2 }, currentQuestion: 2 })
    }

    const 规范题号 = 创建内存存储({
      [SESSION_STORAGE_KEYS.answers]: JSON.stringify({ 1: 0, 2: 1, 4: 2 }),
      [SESSION_STORAGE_KEYS.currentQuestion]: '4',
    })
    expect(restoreSession(规范题号)).toEqual({ kind: 'progress', answers: { 1: 0, 2: 1, 4: 2 }, currentQuestion: 4 })
  })

  it('稀疏但合法的答案仍恢复进度，而非回退到旧结果', () => {
    const 存储 = 创建内存存储({
      [SESSION_STORAGE_KEYS.answers]: JSON.stringify({ 2: 3 }),
      [SESSION_STORAGE_KEYS.currentQuestion]: '损坏值',
      [SESSION_STORAGE_KEYS.result]: JSON.stringify({ scores: 完整分数, answers: 完整答案, completedAt: '2026-08-13T10:00:00.000Z' }),
    })
    expect(restoreSession(存储)).toEqual({ kind: 'progress', answers: { 2: 3 }, currentQuestion: 0 })
  })

  it('完整答案与合法结果优先恢复结果，无合法结果时恢复完成状态', () => {
    const 有结果 = 创建内存存储({
      [SESSION_STORAGE_KEYS.answers]: JSON.stringify(完整答案),
      [SESSION_STORAGE_KEYS.currentQuestion]: '10',
      [SESSION_STORAGE_KEYS.result]: JSON.stringify({ scores: 完整分数, answers: 完整答案, completedAt: '2026-08-13T10:00:00.000Z' }),
    })
    const 无结果 = 创建内存存储({
      [SESSION_STORAGE_KEYS.answers]: JSON.stringify(完整答案),
      [SESSION_STORAGE_KEYS.currentQuestion]: '10',
    })
    expect(restoreSession(有结果)).toEqual({ kind: 'result', result: { scores: 完整分数, answers: 完整答案, completedAt: '2026-08-13T10:00:00.000Z' } })
    expect(restoreSession(无结果)).toEqual({ kind: 'completed', answers: 完整答案, currentQuestion: 55 })
  })

  it('无合法答案时恢复合法旧结果，否则为空', () => {
    const 有结果 = 创建内存存储({
      [SESSION_STORAGE_KEYS.result]: JSON.stringify({ scores: 完整分数, answers: { 1: 0 }, completedAt: '2026-08-13T10:00:00.000Z' }),
    })
    expect(restoreSession(有结果)).toEqual({ kind: 'result', result: { scores: 完整分数, answers: { 1: 0 }, completedAt: '2026-08-13T10:00:00.000Z' } })
    expect(restoreSession(创建内存存储())).toEqual({ kind: 'empty' })
  })

  it('各存储键 JSON 损坏时只清理对应键，局部非法答案仍可恢复', () => {
    const 答案损坏 = 创建内存存储({
      [SESSION_STORAGE_KEYS.answers]: '{',
      [SESSION_STORAGE_KEYS.currentQuestion]: '2',
      [SESSION_STORAGE_KEYS.result]: JSON.stringify({ scores: 完整分数, answers: { 1: 0 }, completedAt: '2026-08-13T10:00:00.000Z' }),
    })
    const 结果损坏 = 创建内存存储({
      [SESSION_STORAGE_KEYS.answers]: JSON.stringify({ 1: 0, 2: 9 }),
      [SESSION_STORAGE_KEYS.currentQuestion]: '1',
      [SESSION_STORAGE_KEYS.result]: '{',
    })
    expect(restoreSession(答案损坏)).toEqual({ kind: 'result', result: { scores: 完整分数, answers: { 1: 0 }, completedAt: '2026-08-13T10:00:00.000Z' } })
    expect(答案损坏.数据).not.toHaveProperty(SESSION_STORAGE_KEYS.answers)
    expect(答案损坏.数据).toHaveProperty(SESSION_STORAGE_KEYS.result)
    expect(restoreSession(结果损坏)).toEqual({ kind: 'progress', answers: { 1: 0 }, currentQuestion: 1 })
    expect(结果损坏.数据).not.toHaveProperty(SESSION_STORAGE_KEYS.result)
    expect(结果损坏.数据).toHaveProperty(SESSION_STORAGE_KEYS.answers)
  })

  it('读取或清理存储抛错时安全回退且继续尝试其他键', () => {
    const 已清理: string[] = []
    const 读取失败 = {
      getItem: () => { throw new Error('不可读取') },
      removeItem: (键: string) => { 已清理.push(键); throw new Error('不可清理') },
    }
    const 部分清理失败 = {
      removeItem: (键: string) => {
        已清理.push(键)
        if (键 === SESSION_STORAGE_KEYS.answers) throw new Error('首键失败')
      },
    }
    expect(restoreSession(读取失败)).toEqual({ kind: 'empty' })
    expect(() => clearProgress(部分清理失败)).not.toThrow()
    expect(() => clearResult(部分清理失败)).not.toThrow()
    expect(已清理).toEqual(['chakra-test-answers', 'chakra-test-current-question', 'chakra-test-result'])
  })

  it('成功双写进度和结果，并在任意写入失败时返回 false 且不回滚', () => {
    const 正常存储 = 创建内存存储()
    expect(saveProgress(正常存储, { 1: 0 }, 0)).toBe(true)
    expect(正常存储.数据).toEqual({ 'chakra-test-answers': '{"1":0}', 'chakra-test-current-question': '0' })
    expect(saveResult(正常存储, { scores: 完整分数, answers: { 1: 0 }, completedAt: '2026-08-13T10:00:00.000Z' })).toBe(true)
    expect(正常存储.数据['chakra-test-result']).toBe('{"scores":{"海底轮":-100,"太阳轮":-50,"脐轮":0,"心轮":25,"喉轮":50,"眉心轮":75,"顶轮":100},"answers":{"1":0},"completedAt":"2026-08-13T10:00:00.000Z"}')

    const 首次失败 = 创建内存存储()
    const 进度写入失败 = {
      setItem: (键: string, 值: string) => {
        if (键 === SESSION_STORAGE_KEYS.answers) throw new Error('首次失败')
        首次失败.setItem(键, 值)
      },
    }
    expect(saveProgress(进度写入失败, { 1: 0 }, 0)).toBe(false)
    expect(首次失败.数据).toEqual({ 'chakra-test-current-question': '0' })

    const 结果失败 = {
      setItem: () => { throw new Error('写入失败') },
    }
    expect(saveResult(结果失败, { scores: 完整分数, answers: {}, completedAt: '2026-08-13T10:00:00.000Z' })).toBe(false)
  })
})
