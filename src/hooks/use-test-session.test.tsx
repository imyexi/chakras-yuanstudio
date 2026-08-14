import { act, renderHook, waitFor } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useTestSession } from '@/hooks/use-test-session'
import {
  getSessionStorageKeys,
  SESSION_STORAGE_KEYS,
  type Answers,
  type StoredResult,
} from '@/lib/test-session'
import type { TestVersion } from '@/lib/test-version'

const THEME_KEY = 'chakra-test-theme-v1'
const PROGRESS_WARNING = '当前设备无法保存答题进度，关闭页面后可能丢失'
const RESULT_WARNING = '当前结果未能保存，关闭页面后可能丢失'

const COMPLETE_ANSWERS: Answers = Object.fromEntries(
  Array.from({ length: 56 }, (_, index) => [index + 1, index % 5]),
)

const SECOND_COMPLETE_ANSWERS: Answers = Object.fromEntries(
  Array.from({ length: 56 }, (_, index) => [index + 1, (index + 2) % 5]),
)

const STORED_RESULT: StoredResult = {
  scores: {
    海底轮: -100,
    太阳轮: -50,
    脐轮: 0,
    心轮: 25,
    喉轮: 50,
    眉心轮: 75,
    顶轮: 100,
  },
  answers: COMPLETE_ANSWERS,
  completedAt: '2026-08-13T10:00:00.000Z',
}

function setTestPathname(pathname: string) {
  window.history.replaceState({}, '', pathname)
}

function setProgress(
  answers: Answers,
  currentQuestion: number,
  version: TestVersion = 'v1',
) {
  const keys = getSessionStorageKeys(version)
  window.localStorage.setItem(keys.answers, JSON.stringify(answers))
  window.localStorage.setItem(keys.currentQuestion, String(currentQuestion))
}

function renderSession() {
  return renderHook(() => useTestSession())
}

function createDeferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

function successfulResponse() {
  return { ok: true, json: async () => ({ success: true }) } as Response
}

describe('useTestSession 恢复、保存与导航', () => {
  beforeEach(() => {
    setTestPathname('/chakras')
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    window.localStorage.clear()
    setTestPathname('/chakras')
  })

  it('服务端首次渲染保持版本未解析，且不会读取浏览器存储', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem')

    function Probe() {
      const session = useTestSession()
      return `${session.pageState}:${String(session.version)}`
    }

    expect(renderToString(<Probe />)).toContain('booting:null')
    expect(getItem).not.toHaveBeenCalled()
  })

  it('客户端 effect 后把空存储恢复为欢迎页', async () => {
    const { result } = renderSession()

    await waitFor(() => expect(result.current.pageState).toBe('welcome'))
    expect(result.current.answers).toEqual({})
    expect(result.current.currentQuestion).toBe(0)
    expect(result.current.progressInfo).toEqual({ answered: 0, total: 56, percentage: 0, completed: false })
  })

  it('恢复未完成进度到欢迎页，并从原题号继续', async () => {
    setProgress({ 1: 0, 2: 1, 4: 3 }, 4)

    const { result } = renderSession()

    await waitFor(() => expect(result.current.pageState).toBe('welcome'))
    expect(result.current.answers).toEqual({ 1: 0, 2: 1, 4: 3 })
    expect(result.current.currentQuestion).toBe(4)
    expect(result.current.progressInfo).toEqual({ answered: 3, total: 56, percentage: 5, completed: false })

    act(() => result.current.continueTest())
    expect(result.current.pageState).toBe('test')
    expect(result.current.answers).toEqual({ 1: 0, 2: 1, 4: 3 })
    expect(result.current.currentQuestion).toBe(4)
  })

  it('恢复完整答案后可继续到第 56 题并提交该答案快照', async () => {
    setProgress(COMPLETE_ANSWERS, 12)
    const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(async () => successfulResponse())
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderSession()

    await waitFor(() => expect(result.current.pageState).toBe('welcome'))
    expect(result.current.currentQuestion).toBe(55)
    expect(result.current.answers).toEqual(COMPLETE_ANSWERS)
    expect(result.current.progressInfo).toEqual({ answered: 56, total: 56, percentage: 100, completed: true })

    act(() => result.current.continueTest())
    expect(result.current.pageState).toBe('test')
    expect(result.current.currentQuestion).toBe(55)

    await act(async () => result.current.submit())
    expect(result.current.pageState).toBe('result')
    expect(result.current.result?.answers).toEqual(COMPLETE_ANSWERS)
    expect(result.current.backupStatus).toBe('saved')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(JSON.parse(fetchMock.mock.calls[0][1]!.body as string).answers).toEqual(COMPLETE_ANSWERS)
  })

  it('恢复已保存结果时直接进入结果页，但不猜测线上备份成功', async () => {
    window.localStorage.setItem(SESSION_STORAGE_KEYS.result, JSON.stringify(STORED_RESULT))

    const { result } = renderSession()

    await waitFor(() => expect(result.current.pageState).toBe('result'))
    expect(result.current.result).toEqual(STORED_RESULT)
    expect(result.current.answers).toEqual(COMPLETE_ANSWERS)
    expect(result.current.backupStatus).toBe('idle')
  })

  it('结果状态选答不会修改内存答案、结果或重新写入进度', async () => {
    window.localStorage.setItem(SESSION_STORAGE_KEYS.result, JSON.stringify(STORED_RESULT))
    const { result } = renderSession()
    await waitFor(() => expect(result.current.pageState).toBe('result'))
    const originalResult = result.current.result

    act(() => result.current.selectAnswer(1, 4))

    expect(result.current.pageState).toBe('result')
    expect(result.current.answers).toEqual(COMPLETE_ANSWERS)
    expect(result.current.result).toBe(originalResult)
    expect(window.localStorage.getItem(SESSION_STORAGE_KEYS.answers)).toBeNull()
    expect(window.localStorage.getItem(SESSION_STORAGE_KEYS.currentQuestion)).toBeNull()
  })

  it('选答时同步更新 Hook 状态和真实 localStorage', async () => {
    const { result } = renderSession()
    await waitFor(() => expect(result.current.pageState).toBe('welcome'))

    act(() => {
      result.current.start()
      result.current.selectAnswer(1, 4)
    })

    expect(result.current.answers).toEqual({ 1: 4 })
    expect(JSON.parse(window.localStorage.getItem(SESSION_STORAGE_KEYS.answers)!)).toEqual({ 1: 4 })
    expect(window.localStorage.getItem(SESSION_STORAGE_KEYS.currentQuestion)).toBe('0')
  })

  it('写入抛错时仍保留内存答案并显示固定进度警告', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('存储不可写')
    })
    const { result } = renderSession()
    await waitFor(() => expect(result.current.pageState).toBe('welcome'))

    act(() => {
      result.current.start()
      result.current.selectAnswer(1, 3)
    })

    expect(result.current.answers).toEqual({ 1: 3 })
    expect(result.current.storageWarning).toBe(PROGRESS_WARNING)
  })

  it('进度写入恢复成功后清除旧的保存警告', async () => {
    const realSetItem = Storage.prototype.setItem
    let storageAvailable = false
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
      if (!storageAvailable && (key === SESSION_STORAGE_KEYS.answers || key === SESSION_STORAGE_KEYS.currentQuestion)) {
        throw new Error('暂时不可写')
      }
      return realSetItem.call(this, key, value)
    })
    const { result } = renderSession()
    await waitFor(() => expect(result.current.pageState).toBe('welcome'))

    act(() => {
      result.current.start()
      result.current.selectAnswer(1, 3)
    })
    expect(result.current.storageWarning).toBe(PROGRESS_WARNING)

    storageAvailable = true
    act(() => result.current.selectAnswer(2, 4))

    expect(result.current.answers).toEqual({ 1: 3, 2: 4 })
    expect(JSON.parse(window.localStorage.getItem(SESSION_STORAGE_KEYS.answers)!)).toEqual({ 1: 3, 2: 4 })
    expect(window.localStorage.getItem(SESSION_STORAGE_KEYS.currentQuestion)).toBe('0')
    expect(result.current.storageWarning).toBeNull()
  })

  it('取得 localStorage 属性抛错时仍可在内存答题和切题', async () => {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'localStorage')
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get: () => {
        throw new Error('无法取得存储')
      },
    })

    try {
      const { result } = renderSession()
      await waitFor(() => expect(result.current.pageState).toBe('welcome'))

      act(() => {
        result.current.start()
        result.current.selectAnswer(1, 2)
        result.current.goToQuestion(8)
      })

      expect(result.current.answers).toEqual({ 1: 2 })
      expect(result.current.currentQuestion).toBe(8)
      expect(result.current.storageWarning).toBe(PROGRESS_WARNING)
    } finally {
      Object.defineProperty(window, 'localStorage', descriptor!)
    }
  })

  it('localStorage 的 getItem 抛错时安全恢复为空会话', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('存储不可读')
    })

    const { result } = renderSession()

    await waitFor(() => expect(result.current.pageState).toBe('welcome'))
    expect(result.current.answers).toEqual({})
    expect(result.current.result).toBeNull()
  })

  it('切题限制在 0 到 55，并把答案和最终索引同步保存', async () => {
    setProgress({ 1: 2 }, 8)
    const { result } = renderSession()
    await waitFor(() => expect(result.current.pageState).toBe('welcome'))
    act(() => result.current.continueTest())

    act(() => result.current.goToQuestion(-1))
    expect(result.current.currentQuestion).toBe(0)
    expect(JSON.parse(window.localStorage.getItem(SESSION_STORAGE_KEYS.answers)!)).toEqual({ 1: 2 })
    expect(window.localStorage.getItem(SESSION_STORAGE_KEYS.currentQuestion)).toBe('0')

    act(() => result.current.goToQuestion(56))
    expect(result.current.currentQuestion).toBe(55)
    expect(JSON.parse(window.localStorage.getItem(SESSION_STORAGE_KEYS.answers)!)).toEqual({ 1: 2 })
    expect(window.localStorage.getItem(SESSION_STORAGE_KEYS.currentQuestion)).toBe('55')
  })

  it('保存并退出会回欢迎页且保留当前进度', async () => {
    const { result } = renderSession()
    await waitFor(() => expect(result.current.pageState).toBe('welcome'))
    act(() => {
      result.current.start()
      result.current.selectAnswer(1, 1)
      result.current.goToQuestion(6)
      result.current.saveAndExit()
    })

    expect(result.current.pageState).toBe('welcome')
    expect(result.current.answers).toEqual({ 1: 1 })
    expect(result.current.currentQuestion).toBe(6)
    expect(JSON.parse(window.localStorage.getItem(SESSION_STORAGE_KEYS.answers)!)).toEqual({ 1: 1 })
    expect(window.localStorage.getItem(SESSION_STORAGE_KEYS.currentQuestion)).toBe('6')
  })

  it('start 和 restart 清会话数据但保留主题', async () => {
    setProgress({ 1: 0 }, 3)
    window.localStorage.setItem(SESSION_STORAGE_KEYS.result, JSON.stringify(STORED_RESULT))
    window.localStorage.setItem(THEME_KEY, 'dark')
    const { result } = renderSession()
    await waitFor(() => expect(result.current.pageState).toBe('welcome'))

    act(() => result.current.start())
    expect(result.current.pageState).toBe('test')
    expect(result.current.answers).toEqual({})
    expect(result.current.result).toBeNull()
    expect(result.current.currentQuestion).toBe(0)
    expect(window.localStorage.getItem(SESSION_STORAGE_KEYS.answers)).toBeNull()
    expect(window.localStorage.getItem(SESSION_STORAGE_KEYS.currentQuestion)).toBeNull()
    expect(window.localStorage.getItem(SESSION_STORAGE_KEYS.result)).toBeNull()
    expect(window.localStorage.getItem(THEME_KEY)).toBe('dark')
    expect(result.current.storageWarning).toBeNull()

    act(() => {
      result.current.selectAnswer(2, 3)
      result.current.restart()
    })
    expect(result.current.pageState).toBe('welcome')
    expect(result.current.answers).toEqual({})
    expect(result.current.currentQuestion).toBe(0)
    expect(window.localStorage.getItem(SESSION_STORAGE_KEYS.answers)).toBeNull()
    expect(window.localStorage.getItem(THEME_KEY)).toBe('dark')
  })

  it('localStorage 的 removeItem 抛错时仍清空内存会话，但保留真实旧键并显示警告', async () => {
    setProgress({ 1: 2 }, 4)
    window.localStorage.setItem(SESSION_STORAGE_KEYS.result, JSON.stringify(STORED_RESULT))
    const { result } = renderSession()
    await waitFor(() => expect(result.current.pageState).toBe('welcome'))
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('存储不可清理')
    })

    act(() => result.current.start())

    expect(result.current.pageState).toBe('test')
    expect(result.current.answers).toEqual({})
    expect(result.current.result).toBeNull()
    expect(result.current.currentQuestion).toBe(0)
    expect(window.localStorage.getItem(SESSION_STORAGE_KEYS.answers)).not.toBeNull()
    expect(window.localStorage.getItem(SESSION_STORAGE_KEYS.currentQuestion)).not.toBeNull()
    expect(window.localStorage.getItem(SESSION_STORAGE_KEYS.result)).not.toBeNull()
    expect(result.current.storageWarning).toBe(PROGRESS_WARNING)
  })

  it('清理后的会话键无法读取确认时显示进度警告', async () => {
    setProgress({ 1: 2 }, 4)
    const { result } = renderSession()
    await waitFor(() => expect(result.current.pageState).toBe('welcome'))
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('无法确认清理结果')
    })

    act(() => result.current.restart())

    expect(result.current.pageState).toBe('welcome')
    expect(result.current.answers).toEqual({})
    expect(result.current.storageWarning).toBe(PROGRESS_WARNING)
  })

  it('hidden 与 beforeunload 在答题时兜底保存，卸载后不再执行', async () => {
    const visibilityDescriptor = Object.getOwnPropertyDescriptor(document, 'visibilityState')
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' })

    try {
      const { result, unmount } = renderSession()
      await waitFor(() => expect(result.current.pageState).toBe('welcome'))
      act(() => {
        result.current.start()
        result.current.selectAnswer(1, 4)
        result.current.goToQuestion(9)
      })

      window.localStorage.removeItem(SESSION_STORAGE_KEYS.answers)
      window.localStorage.removeItem(SESSION_STORAGE_KEYS.currentQuestion)
      act(() => document.dispatchEvent(new Event('visibilitychange')))
      expect(JSON.parse(window.localStorage.getItem(SESSION_STORAGE_KEYS.answers)!)).toEqual({ 1: 4 })
      expect(window.localStorage.getItem(SESSION_STORAGE_KEYS.currentQuestion)).toBe('9')

      window.localStorage.removeItem(SESSION_STORAGE_KEYS.answers)
      act(() => window.dispatchEvent(new Event('beforeunload')))
      expect(JSON.parse(window.localStorage.getItem(SESSION_STORAGE_KEYS.answers)!)).toEqual({ 1: 4 })

      unmount()
      window.localStorage.setItem(SESSION_STORAGE_KEYS.answers, '{"sentinel":true}')
      document.dispatchEvent(new Event('visibilitychange'))
      window.dispatchEvent(new Event('beforeunload'))
      expect(window.localStorage.getItem(SESSION_STORAGE_KEYS.answers)).toBe('{"sentinel":true}')
    } finally {
      if (visibilityDescriptor) Object.defineProperty(document, 'visibilityState', visibilityDescriptor)
    }
  })
})

describe('useTestSession 提交、失败与竞态', () => {
  beforeEach(() => {
    setTestPathname('/chakras')
    window.localStorage.clear()
    window.localStorage.setItem('chakra-device-id', 'device-test-fixed')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    window.localStorage.clear()
    setTestPathname('/chakras')
  })

  it('在 /chakra 只恢复和写入 V2，并向现有 API 提交同一份 V2 分数', async () => {
    setTestPathname('/chakra')
    const v1Keys = getSessionStorageKeys('v1')
    const v2Keys = getSessionStorageKeys('v2')
    const v1Answers = JSON.stringify({ 1: 4, 2: 4 })
    window.localStorage.setItem(v1Keys.answers, v1Answers)
    window.localStorage.setItem(v1Keys.currentQuestion, '1')
    window.localStorage.setItem(THEME_KEY, 'dark')

    const v2Answers: Answers = Object.fromEntries(
      Array.from({ length: 56 }, (_, index) => [index + 1, 2]),
    )
    v2Answers[2] = 0
    v2Answers[3] = 0
    setProgress(v2Answers, 55, 'v2')

    const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(
      async () => successfulResponse(),
    )
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderSession()
    await waitFor(() => expect(result.current.pageState).toBe('welcome'))
    expect(result.current.version).toBe('v2')
    expect(result.current.answers).toEqual(v2Answers)

    await act(async () => result.current.submit())

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, options] = fetchMock.mock.calls[0]
    const body = JSON.parse(options!.body as string)
    expect(url).toBe('/chakras/api/test-results')
    expect(Object.keys(body).sort()).toEqual(['answers', 'deviceId', 'scores'])
    expect(result.current.result?.scores.海底轮).toBe(45)
    expect(body.scores).toEqual(result.current.result?.scores)
    expect(JSON.parse(window.localStorage.getItem(v2Keys.result)!)).toEqual(result.current.result)
    expect(window.localStorage.getItem(v2Keys.answers)).toBeNull()
    expect(window.localStorage.getItem(v2Keys.currentQuestion)).toBeNull()
    expect(window.localStorage.getItem(v1Keys.answers)).toBe(v1Answers)
    expect(window.localStorage.getItem(v1Keys.currentQuestion)).toBe('1')

    act(() => result.current.restart())
    expect(window.localStorage.getItem(v2Keys.result)).toBeNull()
    expect(window.localStorage.getItem(v1Keys.answers)).toBe(v1Answers)
    expect(window.localStorage.getItem(v1Keys.currentQuestion)).toBe('1')
    expect(window.localStorage.getItem(THEME_KEY)).toBe('dark')
  })

  it.each([
    ['只有连续 55 题', Object.fromEntries(Array.from({ length: 55 }, (_, index) => [index + 1, index % 5])), 56],
    ['稀疏答案', { ...COMPLETE_ANSWERS, 3: undefined } as unknown as Answers, 3],
  ])('%s 时不生成结果、不请求网络并定位首个遗漏题', async (_name, answers, missingQuestion) => {
    setProgress(answers, 40)
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderSession()
    await waitFor(() => expect(result.current.pageState).toBe('welcome'))

    await act(async () => result.current.submit())

    expect(result.current.pageState).toBe('test')
    expect(result.current.currentQuestion).toBe(missingQuestion - 1)
    expect(result.current.result).toBeNull()
    expect(result.current.backupStatus).toBe('idle')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('首次提交定位遗漏题，补齐后第二次提交成功', async () => {
    const incompleteAnswers = { ...COMPLETE_ANSWERS }
    delete incompleteAnswers[3]
    setProgress(incompleteAnswers, 40)
    const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(async () => successfulResponse())
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderSession()
    await waitFor(() => expect(result.current.pageState).toBe('welcome'))

    await act(async () => result.current.submit())
    expect(result.current.pageState).toBe('test')
    expect(result.current.currentQuestion).toBe(2)
    expect(result.current.result).toBeNull()
    expect(result.current.backupStatus).toBe('idle')
    expect(fetchMock).not.toHaveBeenCalled()

    act(() => result.current.selectAnswer(3, 2))
    await act(async () => result.current.submit())

    expect(result.current.pageState).toBe('result')
    expect(result.current.currentQuestion).toBe(2)
    expect(result.current.result?.answers).toEqual(COMPLETE_ANSWERS)
    expect(result.current.backupStatus).toBe('saved')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(JSON.parse(fetchMock.mock.calls[0][1]!.body as string).answers).toEqual(COMPLETE_ANSWERS)
  })

  it('完整提交在网络返回前就保存不可变结果、清理进度并显示 saving', async () => {
    setProgress(COMPLETE_ANSWERS, 55)
    const request = createDeferred<Response>()
    const fetchMock = vi.fn(() => request.promise)
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderSession()
    await waitFor(() => expect(result.current.pageState).toBe('welcome'))

    let submitPromise!: Promise<void>
    act(() => {
      submitPromise = result.current.submit()
    })

    expect(result.current.pageState).toBe('result')
    expect(result.current.backupStatus).toBe('saving')
    expect(result.current.result?.answers).toEqual(COMPLETE_ANSWERS)
    expect(result.current.result?.answers).not.toBe(result.current.answers)
    expect(window.localStorage.getItem(SESSION_STORAGE_KEYS.result)).not.toBeNull()
    expect(window.localStorage.getItem(SESSION_STORAGE_KEYS.answers)).toBeNull()
    expect(window.localStorage.getItem(SESSION_STORAGE_KEYS.currentQuestion)).toBeNull()

    const originalSnapshot = result.current.result
    act(() => result.current.selectAnswer(1, 4))
    expect(result.current.result).toBe(originalSnapshot)
    expect(result.current.result?.answers[1]).toBe(0)

    await act(async () => {
      request.resolve(successfulResponse())
      await submitPromise
    })
    expect(result.current.backupStatus).toBe('saved')
  })

  it('本地结果写入失败时仍显示结果和 saving，保留进度并给出固定警告', async () => {
    setProgress(COMPLETE_ANSWERS, 55)
    const realSetItem = Storage.prototype.setItem
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
      if (key === SESSION_STORAGE_KEYS.result) throw new Error('结果不可写')
      return realSetItem.call(this, key, value)
    })
    const request = createDeferred<Response>()
    vi.stubGlobal('fetch', vi.fn(() => request.promise))
    const { result } = renderSession()
    await waitFor(() => expect(result.current.pageState).toBe('welcome'))

    let submitPromise!: Promise<void>
    act(() => {
      submitPromise = result.current.submit()
    })

    expect(result.current.pageState).toBe('result')
    expect(result.current.backupStatus).toBe('saving')
    expect(result.current.result).not.toBeNull()
    expect(result.current.storageWarning).toBe(RESULT_WARNING)
    expect(JSON.parse(window.localStorage.getItem(SESSION_STORAGE_KEYS.answers)!)).toEqual(COMPLETE_ANSWERS)
    expect(window.localStorage.getItem(SESSION_STORAGE_KEYS.currentQuestion)).toBe('55')

    await act(async () => {
      request.resolve(successfulResponse())
      await submitPromise
    })
  })

  it('请求固定路径，且请求体严格只有 deviceId、scores、answers', async () => {
    setProgress(COMPLETE_ANSWERS, 55)
    const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(async () => successfulResponse())
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderSession()
    await waitFor(() => expect(result.current.pageState).toBe('welcome'))

    await act(async () => result.current.submit())

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe('/chakras/api/test-results')
    expect(options).toEqual(expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }))
    const body = JSON.parse(options!.body as string)
    expect(Object.keys(body).sort()).toEqual(['answers', 'deviceId', 'scores'])
    expect(body.deviceId).toBe('device-test-fixed')
    expect(body.answers).toEqual(COMPLETE_ANSWERS)
    expect(body.scores).toEqual(result.current.result?.scores)
  })

  it.each([
    ['HTTP 错误', async () => ({ ok: false, json: async () => ({ success: true }) } as Response)],
    ['fetch 拒绝', async () => { throw new Error('断网') }],
    ['非 JSON', async () => ({ ok: true, json: async () => { throw new SyntaxError('非 JSON') } } as unknown as Response)],
    ['success 为 false', async () => ({ ok: true, json: async () => ({ success: false }) } as Response)],
  ])('%s 会标记 failed 且保留本地结果', async (_name, fetchImplementation) => {
    setProgress(COMPLETE_ANSWERS, 55)
    vi.stubGlobal('fetch', vi.fn(fetchImplementation))
    const { result } = renderSession()
    await waitFor(() => expect(result.current.pageState).toBe('welcome'))

    await act(async () => result.current.submit())

    expect(result.current.pageState).toBe('result')
    expect(result.current.backupStatus).toBe('failed')
    expect(result.current.result).not.toBeNull()
    expect(JSON.parse(window.localStorage.getItem(SESSION_STORAGE_KEYS.result)!)).toEqual(result.current.result)
  })

  it('同一同步事件循环重复提交只发一个请求', async () => {
    setProgress(COMPLETE_ANSWERS, 55)
    const request = createDeferred<Response>()
    const fetchMock = vi.fn(() => request.promise)
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderSession()
    await waitFor(() => expect(result.current.pageState).toBe('welcome'))

    let firstSubmit!: Promise<void>
    let secondSubmit!: Promise<void>
    act(() => {
      firstSubmit = result.current.submit()
      secondSubmit = result.current.submit()
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    await act(async () => {
      request.resolve(successfulResponse())
      await Promise.all([firstSubmit, secondSubmit])
    })
    expect(result.current.backupStatus).toBe('saved')
  })

  it.each([
    ['成功', (request: ReturnType<typeof createDeferred<Response>>) => request.resolve(successfulResponse())],
    ['失败', (request: ReturnType<typeof createDeferred<Response>>) => request.reject(new Error('旧请求失败'))],
  ])('restart 后旧请求%s响应不能污染新会话', async (_name, settleRequest) => {
    setProgress(COMPLETE_ANSWERS, 55)
    const request = createDeferred<Response>()
    vi.stubGlobal('fetch', vi.fn(() => request.promise))
    const { result } = renderSession()
    await waitFor(() => expect(result.current.pageState).toBe('welcome'))

    let submitPromise!: Promise<void>
    act(() => {
      submitPromise = result.current.submit()
      result.current.restart()
    })
    expect(result.current.pageState).toBe('welcome')
    expect(result.current.backupStatus).toBe('idle')
    expect(result.current.result).toBeNull()

    await act(async () => {
      settleRequest(request)
      await submitPromise
    })

    expect(result.current.pageState).toBe('welcome')
    expect(result.current.backupStatus).toBe('idle')
    expect(result.current.result).toBeNull()
    expect(result.current.answers).toEqual({})
  })

  it('旧会话请求晚于新提交失败时不污染新结果和备份状态', async () => {
    setProgress(COMPLETE_ANSWERS, 55)
    const oldRequest = createDeferred<Response>()
    const newRequest = createDeferred<Response>()
    const fetchMock = vi.fn()
      .mockImplementationOnce(() => oldRequest.promise)
      .mockImplementationOnce(() => newRequest.promise)
    vi.stubGlobal('fetch', fetchMock)
    const { result } = renderSession()
    await waitFor(() => expect(result.current.pageState).toBe('welcome'))

    let oldSubmit!: Promise<void>
    act(() => {
      oldSubmit = result.current.submit()
    })
    expect(result.current.pageState).toBe('result')
    expect(result.current.result?.answers).toEqual(COMPLETE_ANSWERS)

    let newSubmit!: Promise<void>
    act(() => {
      result.current.restart()
      result.current.start()
      for (let question = 1; question <= 56; question += 1) {
        result.current.selectAnswer(question, SECOND_COMPLETE_ANSWERS[question])
      }
      newSubmit = result.current.submit()
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(result.current.pageState).toBe('result')
    expect(result.current.result?.answers).toEqual(SECOND_COMPLETE_ANSWERS)
    expect(result.current.backupStatus).toBe('saving')
    const firstBody = JSON.parse(fetchMock.mock.calls[0][1]!.body as string)
    const secondBody = JSON.parse(fetchMock.mock.calls[1][1]!.body as string)
    expect(firstBody.answers).toEqual(COMPLETE_ANSWERS)
    expect(secondBody.answers).toEqual(SECOND_COMPLETE_ANSWERS)

    await act(async () => {
      newRequest.resolve(successfulResponse())
      await newSubmit
    })
    const newResult = result.current.result
    expect(result.current.backupStatus).toBe('saved')

    await act(async () => {
      oldRequest.resolve({ ok: false, json: async () => ({ success: false }) } as Response)
      await oldSubmit
    })

    expect(result.current.pageState).toBe('result')
    expect(result.current.answers).toEqual(SECOND_COMPLETE_ANSWERS)
    expect(result.current.result).toBe(newResult)
    expect(result.current.result?.answers).toEqual(SECOND_COMPLETE_ANSWERS)
    expect(result.current.backupStatus).toBe('saved')
    expect(JSON.parse(window.localStorage.getItem(SESSION_STORAGE_KEYS.result)!)).toEqual(newResult)
  })
})
