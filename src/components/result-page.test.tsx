import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { archetypeMap } from '@/lib/chakra-archetypes'
import type { StoredResult } from '@/lib/test-session'
import { ResultPage } from './result-page'
import { TestShell } from './test-shell'
import { ThemeProvider } from './theme-provider'

vi.mock('next/image', () => ({
  default: ({ priority: _priority, unoptimized: _unoptimized, fill: _fill, alt, ...props }: React.ComponentProps<'img'> & {
    priority?: boolean
    unoptimized?: boolean
    fill?: boolean
  }) => (
    <img {...props} alt={alt ?? ''} />
  ),
}))

const FIXTURES = [
  {
    name: 'Heart-Solar',
    scores: { 海底轮: -42, 太阳轮: 71, 脐轮: 18, 心轮: 88, 喉轮: 36, 眉心轮: 49, 顶轮: 12 },
    displayName: '老好人',
    headline: '你不是没脾气，你是会把场面照顾好。',
    formalName: '温柔领导者',
    primary: '心轮 +88%',
    secondary: '太阳轮 +71%',
    lowest: '海底轮 -42%',
    average: '心轮桥梁型 · 平均 33%',
    people: ['奥普拉·温弗瑞', '杨澜', '米歇尔·奥巴马'],
  },
  {
    name: 'Sacral-Throat',
    scores: { 海底轮: 7, 太阳轮: 44, 脐轮: 93, 心轮: 22, 喉轮: 75, 眉心轮: 31, 顶轮: -55 },
    displayName: '灵感喷泉',
    headline: '你一开口，脑洞就开始冒泡泡。',
    formalName: '灵感表达者',
    primary: '脐轮 +93%',
    secondary: '喉轮 +75%',
    lowest: '顶轮 -55%',
    average: '下三轮强 · 平均 31%',
    people: ['Lady Gaga', '王菲', '邓紫棋'],
  },
  {
    name: 'ThirdEye-Root',
    scores: { 海底轮: 74, 太阳轮: 35, 脐轮: -61, 心轮: 28, 喉轮: 46, 眉心轮: 91, 顶轮: 13 },
    displayName: '现实雷达员',
    headline: '别人看热闹，你已经看见底层结构。',
    formalName: '现实洞察者',
    primary: '眉心轮 +91%',
    secondary: '海底轮 +74%',
    lowest: '脐轮 -61%',
    average: '上三轮强 · 平均 32%',
    people: ['董明珠', '屠呦呦', '埃隆·马斯克'],
  },
] as const

function makeResult(scores: Record<string, number>): StoredResult {
  return {
    scores,
    answers: {},
    completedAt: '2026-08-13T12:00:00.000Z',
  }
}

function renderHeartSolar(overrides: Partial<React.ComponentProps<typeof ResultPage>> = {}) {
  const props: React.ComponentProps<typeof ResultPage> = {
    result: makeResult(FIXTURES[0].scores),
    backupStatus: 'idle',
    storageWarning: null,
    onRestart: vi.fn(),
    ...overrides,
  }
  return { ...render(<ResultPage {...props} />), props }
}

function setClipboard(writeText?: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: writeText ? { writeText } : undefined,
  })
}

function setExecCommand(implementation: (command: string) => boolean) {
  Object.defineProperty(document, 'execCommand', {
    configurable: true,
    value: vi.fn(implementation),
  })
}

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.restoreAllMocks()
  setClipboard(undefined)
  Reflect.deleteProperty(document, 'execCommand')
})

describe('ResultPage 动态原型', () => {
  it('装配进真实 TestShell 后只保留外壳 main，并以 article 承载结果报告', () => {
    const { container } = render(
      <ThemeProvider>
        <TestShell>
          <ResultPage
            result={makeResult(FIXTURES[0].scores)}
            backupStatus="idle"
            storageWarning={null}
            onRestart={vi.fn()}
          />
        </TestShell>
      </ThemeProvider>
    )

    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(container.querySelector('article.result-report')).toBeInTheDocument()
  })

  it.each(FIXTURES)('$name 使用真实分数切换展示文案、人物与四项摘要', (fixture) => {
    render(
      <ResultPage
        result={makeResult(fixture.scores)}
        backupStatus="idle"
        storageWarning={null}
        onRestart={vi.fn()}
      />
    )

    expect(screen.getByRole('heading', { level: 2, name: fixture.displayName })).toBeInTheDocument()
    expect(screen.getByText(fixture.headline)).toBeInTheDocument()
    expect(screen.getByText(fixture.formalName)).toBeInTheDocument()

    const summary = screen.getByRole('region', { name: '结果摘要' })
    expect(within(summary).getByText(fixture.primary)).toBeInTheDocument()
    expect(within(summary).getByText(fixture.secondary)).toBeInTheDocument()
    expect(within(summary).getByText(fixture.lowest)).toBeInTheDocument()
    expect(within(summary).getByText(fixture.average)).toBeInTheDocument()

    const people = screen.getByRole('region', { name: '代表人物参考' })
    fixture.people.forEach((person) => {
      expect(within(people).getByText(person)).toBeInTheDocument()
    })
    expect(within(people).getAllByRole('listitem')).toHaveLength(3)
  })
})

describe('ResultPage 章节、数据与分析', () => {
  it('按报告、人物、数据、分析和分享顺序组织章节且全页只有一个 h1', () => {
    renderHeartSolar()

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('你的脉轮人物原型报告')

    const headings = screen.getAllByRole('heading').map((heading) => heading.textContent)
    expect(headings).toEqual([
      '你的脉轮人物原型报告',
      '老好人',
      '代表人物参考',
      '七轮数据与依据',
      '深度分析与成长方向',
      '你的当前能量模式',
      '优势如何形成',
      '需要留意什么',
      '分享与继续探索',
    ])

    const summary = screen.getByRole('region', { name: '结果摘要' })
    const people = screen.getByRole('region', { name: '代表人物参考' })
    expect(summary.compareDocumentPosition(people) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(within(summary).queryByText('奥普拉·温弗瑞')).not.toBeInTheDocument()
  })

  it('七轮图与读屏表格按业务顺序呈现同一组原始分数和角色', () => {
    const { container } = renderHeartSolar()
    const visibleChart = container.querySelector('[data-testid="chakra-score-chart"]')
    const table = screen.getByRole('table', { name: '七轮原始分数与角色' })

    expect(visibleChart).toHaveAttribute('aria-hidden', 'true')
    expect(visibleChart?.querySelectorAll('.chakra-score-row')).toHaveLength(7)
    expect(visibleChart?.querySelectorAll('.chakra-score-track__zero')).toHaveLength(7)
    const bars = visibleChart?.querySelectorAll<HTMLElement>('.chakra-score-track__bar')
    expect(bars?.[0]).toHaveStyle({ left: '29%', width: '21%' })
    expect(bars?.[1]).toHaveStyle({ left: '50%', width: '35.5%' })
    expect(within(table).getAllByRole('row')).toHaveLength(8)
    expect(within(table).getAllByRole('columnheader').map((cell) => cell.textContent)).toEqual([
      '脉轮',
      '原始分数',
      '角色',
    ])
    expect(within(table).getAllByRole('row').slice(1).map((row) => row.textContent)).toEqual([
      '海底轮-42%成长课题',
      '太阳轮+71%辅助风格',
      '脐轮+18%当前能量',
      '心轮+88%主导能量',
      '喉轮+36%当前能量',
      '眉心轮+49%当前能量',
      '顶轮+12%当前能量',
    ])
  })

  it('展示生成结果的 summary、strengths 和 shadow，但收住延伸分析边界', () => {
    renderHeartSolar()

    expect(screen.getByText(/你当前呈现出「温柔领导者」的能量模式/)).toBeInTheDocument()
    expect(screen.getByText('你能让人感到被看见、被接住，也适合在群体里建立信任和凝聚力。')).toBeInTheDocument()
    expect(screen.getByText('你有执行力和影响欲，能把想法往前推，也能在关键时刻承担决策。')).toBeInTheDocument()
    expect(screen.getByText(/这不是固定人格，而是当前能量失衡时需要留意的倾向/)).toBeInTheDocument()
    expect(screen.getByText('关系模式、工作模式与个人调整建议将在咨询中结合你的具体情况展开。')).toBeInTheDocument()
    expect(screen.queryByText(/你在关系里追求温柔、理解和互相支持/)).not.toBeInTheDocument()
    expect(screen.queryByText(/你适合教育、咨询、服务、公益、社群/)).not.toBeInTheDocument()
    expect(screen.queryByText('尝试做一次身体扫描冥想')).not.toBeInTheDocument()
  })

  it('罕见组合只给出克制提示', () => {
    renderHeartSolar({
      result: makeResult({ 海底轮: -30, 太阳轮: 22, 脐轮: 8, 心轮: 41, 喉轮: 49, 眉心轮: 82, 顶轮: 95 }),
    })

    expect(screen.getByText('这是一个相对少见的能量组合')).toBeInTheDocument()
    expect(screen.queryByText(/概率|小概率人格|永久人格/)).not.toBeInTheDocument()
  })

  it('人物为空时保留边界说明且不借用其他原型', () => {
    const originalPeople = archetypeMap.heart_solar.celebrities
    archetypeMap.heart_solar.celebrities = []

    try {
      renderHeartSolar()
      const people = screen.getByRole('region', { name: '代表人物参考' })
      expect(within(people).getByText('仅用于帮助理解该原型呈现出的公众气质，不代表对人物真实性格、经历、成就或心理状态的判断。')).toBeInTheDocument()
      expect(within(people).getByText('当前原型暂无人物参考')).toBeInTheDocument()
      expect(within(people).queryAllByRole('listitem')).toHaveLength(0)
    } finally {
      archetypeMap.heart_solar.celebrities = originalPeople
    }
  })
})

describe('ResultPage 保存状态与操作', () => {
  it.each([
    ['saving', '正在备份结果'],
    ['saved', '结果已在线备份'],
    ['failed', '结果已保存在当前设备，在线备份暂未完成'],
  ] as const)('%s 显示对应在线备份状态', (backupStatus, expected) => {
    renderHeartSolar({ backupStatus })
    expect(screen.getByRole('status')).toHaveTextContent(expected)
  })

  it('idle 不显示在线备份，存储警告以 alert 独立保留', () => {
    renderHeartSolar({ storageWarning: '当前浏览器无法持久保存结果' })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('当前浏览器无法持久保存结果')
  })

  it('顶部分享快捷动作滚动到底部唯一分享区，两个重测入口复用回调', () => {
    const scrollIntoView = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    const onRestart = vi.fn()
    renderHeartSolar({ onRestart })

    fireEvent.click(screen.getByRole('button', { name: '分享结果' }))
    expect(screen.getByRole('region', { name: '分享与继续探索' })).toHaveAttribute('id', 'result-share-actions')
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })

    fireEvent.click(screen.getByRole('button', { name: '顶部重新测试' }))
    fireEvent.click(screen.getByRole('button', { name: '重新测试' }))
    expect(onRestart).toHaveBeenCalledTimes(2)
  })

  it('呈现原生二维码、免责声明与品牌', () => {
    renderHeartSolar()
    const qrCode = screen.getByRole('img', { name: '添加圆圆微信以咨询完整分析的二维码' })
    expect(qrCode).toHaveAttribute('src', '/chakras/qrcode.png')
    expect(screen.getByText('本测试结果仅用于自我探索、情绪觉察和个人成长参考，不构成医学、心理诊断或治疗建议。如你正经历持续的心理痛苦或身体不适，请寻求专业人士支持。')).toBeInTheDocument()
    expect(screen.getByText('@圆圆如意')).toBeInTheDocument()
  })
})

describe('ResultPage 分享复制', () => {
  const shareText = `我的脉轮人物原型：老好人

你不是没脾气，你是会把场面照顾好。

代表人物参考：奥普拉·温弗瑞 Oprah Winfrey · 杨澜 · 米歇尔·奥巴马 Michelle Obama

https://yyry.studio/chakras`

  it('优先使用 Clipboard API，成功反馈两秒后恢复且卸载会清理 timer', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockResolvedValue(undefined)
    setClipboard(writeText)
    const { unmount } = renderHeartSolar()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '复制分享摘要' }))
      await Promise.resolve()
    })

    expect(writeText).toHaveBeenCalledWith(shareText)
    expect(screen.getByText('已复制，可粘贴分享给好友')).toHaveAttribute('aria-live', 'polite')
    act(() => vi.advanceTimersByTime(1999))
    expect(screen.getByText('已复制，可粘贴分享给好友')).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(1))
    expect(screen.queryByText('已复制，可粘贴分享给好友')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '复制分享摘要' }))
    unmount()
    act(() => vi.runOnlyPendingTimers())
  })

  it('Clipboard API 不存在时用只读临时 textarea 和 execCommand 成功回退', async () => {
    setClipboard(undefined)
    setExecCommand(() => true)
    renderHeartSolar()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '复制分享摘要' }))
      await Promise.resolve()
    })

    expect(document.execCommand).toHaveBeenCalledWith('copy')
    expect(screen.getByText('已复制，可粘贴分享给好友')).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: '手动复制分享摘要' })).not.toBeInTheDocument()
    expect(document.body.querySelectorAll('textarea')).toHaveLength(0)
  })

  it('Clipboard reject 且 execCommand 返回 false 时明确失败并保留可选全文', async () => {
    setClipboard(vi.fn().mockRejectedValue(new Error('denied')))
    setExecCommand(() => false)
    renderHeartSolar()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '复制分享摘要' }))
      await Promise.resolve()
    })

    expect(screen.queryByText('已复制，可粘贴分享给好友')).not.toBeInTheDocument()
    expect(screen.getByText('自动复制失败，请手动选择下方文字')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: '手动复制分享摘要' })).toHaveValue(shareText)
    expect(screen.getByRole('textbox', { name: '手动复制分享摘要' })).toHaveAttribute('readonly')
  })

  it('execCommand 抛错时也进入手动复制而不泄漏临时 textarea', async () => {
    setClipboard(undefined)
    setExecCommand(() => {
      throw new Error('copy unavailable')
    })
    renderHeartSolar()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '复制分享摘要' }))
      await Promise.resolve()
    })

    expect(screen.getByText('自动复制失败，请手动选择下方文字')).toBeInTheDocument()
    expect(screen.getAllByRole('textbox')).toHaveLength(1)
    expect(screen.getByRole('textbox', { name: '手动复制分享摘要' })).toHaveValue(shareText)
  })

  it.each(['resolve', 'reject'] as const)('卸载后 Clipboard %s 不再回退、更新状态或创建 timer', async (outcome) => {
    vi.useFakeTimers()
    const pending = deferred<void>()
    const execCommand = vi.fn(() => false)
    setClipboard(vi.fn(() => pending.promise))
    setExecCommand(execCommand)
    const { unmount } = renderHeartSolar()

    fireEvent.click(screen.getByRole('button', { name: '复制分享摘要' }))
    unmount()
    await act(async () => {
      if (outcome === 'resolve') pending.resolve()
      else pending.reject(new Error('denied after unmount'))
      await Promise.resolve()
    })

    expect(execCommand).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('两次复制逆序完成时旧失败不能覆盖最新成功或创建额外 timer', async () => {
    vi.useFakeTimers()
    const first = deferred<void>()
    const second = deferred<void>()
    const writeText = vi.fn()
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise)
    setClipboard(writeText)
    setExecCommand(() => false)
    renderHeartSolar()

    fireEvent.click(screen.getByRole('button', { name: '复制分享摘要' }))
    fireEvent.click(screen.getByRole('button', { name: '复制分享摘要' }))
    await act(async () => {
      second.resolve()
      await Promise.resolve()
    })
    expect(screen.getByText('已复制，可粘贴分享给好友')).toBeInTheDocument()
    expect(vi.getTimerCount()).toBe(1)

    await act(async () => {
      first.reject(new Error('stale denial'))
      await Promise.resolve()
    })

    expect(screen.getByText('已复制，可粘贴分享给好友')).toBeInTheDocument()
    expect(screen.queryByText('自动复制失败，请手动选择下方文字')).not.toBeInTheDocument()
    expect(vi.getTimerCount()).toBe(1)
  })

  it('两次复制逆序完成时旧成功不能覆盖最新失败或创建 timer', async () => {
    vi.useFakeTimers()
    const first = deferred<void>()
    const second = deferred<void>()
    const writeText = vi.fn()
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise)
    setClipboard(writeText)
    setExecCommand(() => false)
    renderHeartSolar()

    fireEvent.click(screen.getByRole('button', { name: '复制分享摘要' }))
    fireEvent.click(screen.getByRole('button', { name: '复制分享摘要' }))
    await act(async () => {
      second.reject(new Error('latest denial'))
      await Promise.resolve()
    })
    expect(screen.getByText('自动复制失败，请手动选择下方文字')).toBeInTheDocument()
    const timerCountAfterLatestAttempt = vi.getTimerCount()

    await act(async () => {
      first.resolve()
      await Promise.resolve()
    })

    expect(screen.getByText('自动复制失败，请手动选择下方文字')).toBeInTheDocument()
    expect(screen.queryByText('已复制，可粘贴分享给好友')).not.toBeInTheDocument()
    expect(vi.getTimerCount()).toBe(timerCountAfterLatestAttempt)
  })
})
