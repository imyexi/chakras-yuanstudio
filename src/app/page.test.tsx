import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '@/components/theme-provider'
import { questions } from '@/lib/chakra-data'
import type { StoredResult } from '@/lib/test-session'
import { useTestSession } from '@/hooks/use-test-session'
import Home from './page'

const hookControl = vi.hoisted(() => ({ current: null as unknown }))

vi.mock('@/hooks/use-test-session', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks/use-test-session')>()
  return {
    ...actual,
    useTestSession: () => hookControl.current ?? actual.useTestSession(),
  }
})

vi.mock('next/image', () => ({
  default: ({
    priority: _priority,
    unoptimized: _unoptimized,
    fill: _fill,
    alt,
    ...props
  }: React.ComponentProps<'img'> & {
    priority?: boolean
    unoptimized?: boolean
    fill?: boolean
  }) => <img {...props} alt={alt ?? ''} />,
}))

type Session = ReturnType<typeof useTestSession>

const STORED_RESULT: StoredResult = {
  scores: {
    海底轮: -42,
    太阳轮: 71,
    脐轮: 18,
    心轮: 88,
    喉轮: 36,
    眉心轮: 49,
    顶轮: 12,
  },
  answers: {},
  completedAt: '2026-08-13T12:00:00.000Z',
}

function createSession(overrides: Partial<Session> = {}) {
  const callbacks = {
    start: vi.fn(),
    continueTest: vi.fn(),
    saveAndExit: vi.fn(),
    selectAnswer: vi.fn(),
    goToQuestion: vi.fn(),
    submit: vi.fn(async () => {}),
    restart: vi.fn(),
  }
  const session: Session = {
    pageState: 'welcome',
    currentQuestion: 0,
    answers: {},
    result: null,
    backupStatus: 'idle',
    storageWarning: null,
    progressInfo: { answered: 0, total: 56, percentage: 0, completed: false },
    ...callbacks,
    ...overrides,
  }
  return { callbacks, session }
}

function renderHome(session?: Session) {
  hookControl.current = session ?? null
  return render(
    <ThemeProvider>
      <Home />
    </ThemeProvider>
  )
}

function expectSinglePageLandmarks() {
  expect(screen.getAllByRole('navigation', { name: '主要导航' })).toHaveLength(1)
  expect(screen.getAllByRole('main')).toHaveLength(1)
  expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
}

afterEach(() => {
  hookControl.current = null
  vi.restoreAllMocks()
  window.localStorage.clear()
  document.documentElement.className = ''
  document.documentElement.style.colorScheme = ''
  vi.clearAllTimers()
  vi.useRealTimers()
})

describe('Home 真实启动流程', () => {
  it('服务端首帧只显示恢复态外壳，不提前显示欢迎内容', () => {
    hookControl.current = null

    const html = renderToString(
      <ThemeProvider>
        <Home />
      </ThemeProvider>
    )
    const document = new DOMParser().parseFromString(html, 'text/html')

    expect(document.querySelectorAll('nav')).toHaveLength(1)
    expect(document.querySelectorAll('main')).toHaveLength(1)
    expect(document.querySelectorAll('h1')).toHaveLength(1)
    expect(document.querySelector('[role="status"]')?.textContent).toContain('正在恢复测试')
    expect(document.body.textContent).not.toContain('开始测试')
  })

  it('空 localStorage 在真实 effect 后进入新用户欢迎页', async () => {
    window.localStorage.clear()

    renderHome()

    expect(await screen.findByRole('button', { name: '开始测试' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('看见你的能量秩序')
    expectSinglePageLandmarks()
  })
})

describe('Home 状态装配', () => {
  it('页面从答题切换到结果报告时回到顶部', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(223)
    const { session } = createSession({
      pageState: 'test',
      currentQuestion: 55,
      answers: { 56: 2 },
    })
    const view = renderHome(session)

    scrollTo.mockClear()
    hookControl.current = {
      ...session,
      pageState: 'result',
      result: STORED_RESULT,
      backupStatus: 'saved',
    }
    view.rerender(
      <ThemeProvider>
        <Home />
      </ThemeProvider>
    )

    expect(scrollTo).toHaveBeenCalledOnce()
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' })
  })

  it('welcome 新用户开始测试只调用 start', async () => {
    const user = userEvent.setup()
    const { callbacks, session } = createSession({
      progressInfo: { answered: 0, total: 56, percentage: 0, completed: false },
    })

    renderHome(session)
    await user.click(screen.getByRole('button', { name: '开始测试' }))

    expect(callbacks.start).toHaveBeenCalledOnce()
    expect(callbacks.continueTest).not.toHaveBeenCalled()
    expect(callbacks.restart).not.toHaveBeenCalled()
  })

  it('welcome 续答显示真实进度，并映射继续与重新开始回调', async () => {
    const user = userEvent.setup()
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const { callbacks, session } = createSession({
      progressInfo: { answered: 24, total: 56, percentage: 43, completed: false },
    })

    renderHome(session)

    expect(screen.getByText('继续上一次探索')).toBeInTheDocument()
    expect(screen.getByText('已完成 24 / 56 题 · 进度仅保存在当前设备')).toBeInTheDocument()
    expectSinglePageLandmarks()

    await user.click(screen.getByRole('button', { name: '继续测试' }))
    await user.click(screen.getByRole('button', { name: '重新开始' }))

    expect(callbacks.continueTest).toHaveBeenCalledOnce()
    expect(confirm).toHaveBeenCalledWith('这会清除当前设备上的答题进度。是否重新开始？')
    expect(callbacks.restart).toHaveBeenCalledOnce()
  })

  it('test 显示当前题和原答案，并让桌面与移动暂存入口互补显示', () => {
    const { callbacks, session } = createSession({
      pageState: 'test',
      currentQuestion: 1,
      answers: { 2: 2 },
    })

    renderHome(session)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(questions[1].text)
    expect(screen.getByRole('radio', { name: '中等' })).toBeChecked()
    expect(screen.getByText('问题 2 / 56')).toBeInTheDocument()
    expectSinglePageLandmarks()

    fireEvent.click(screen.getByRole('radio', { name: '强烈' }))
    fireEvent.click(screen.getByRole('button', { name: '上一题' }))
    fireEvent.click(screen.getByRole('button', { name: '下一题' }))
    const saveButtons = screen.getAllByRole('button', { name: '暂存并退出' })
    expect(saveButtons).toHaveLength(2)
    expect(saveButtons[0]).toHaveClass('hidden', 'md:inline-flex')
    expect(saveButtons[1]).toHaveClass('md:hidden')
    saveButtons.forEach((button) => fireEvent.click(button))

    expect(callbacks.selectAnswer).toHaveBeenCalledWith(2, 3)
    expect(callbacks.goToQuestion).toHaveBeenCalledWith(0)
    expect(callbacks.goToQuestion).toHaveBeenCalledWith(2)
    expect(callbacks.saveAndExit).toHaveBeenCalledTimes(2)
  })

  it('test 存储不可用时让桌面与移动入口都明确退出且不承诺暂存', () => {
    const { callbacks, session } = createSession({
      pageState: 'test',
      storageWarning: '当前设备无法保存答题进度，关闭页面后可能丢失',
    })

    renderHome(session)

    const exitButtons = screen.getAllByRole('button', { name: '退出测试' })
    expect(exitButtons).toHaveLength(2)
    expect(exitButtons[0]).toHaveClass('hidden', 'md:inline-flex')
    expect(exitButtons[1]).toHaveClass('md:hidden')
    expect(screen.queryByRole('button', { name: '暂存并退出' })).not.toBeInTheDocument()

    exitButtons.forEach((button) => fireEvent.click(button))
    expect(callbacks.saveAndExit).toHaveBeenCalledTimes(2)
  })

  it('test 末题只通过薄适配调用异步提交', () => {
    const { callbacks, session } = createSession({
      pageState: 'test',
      currentQuestion: 55,
      answers: { 56: 2 },
    })

    renderHome(session)
    fireEvent.click(screen.getByRole('button', { name: '查看结果' }))

    expect(callbacks.submit).toHaveBeenCalledOnce()
  })

  it('result 渲染真实动态原型、备份状态和重测动作', () => {
    const { callbacks, session } = createSession({
      pageState: 'result',
      result: STORED_RESULT,
      backupStatus: 'saved',
    })

    renderHome(session)

    expect(screen.getByText('老好人')).toBeInTheDocument()
    expect(screen.getByText('温柔领导者')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('结果已在线备份')
    expect(screen.getByText('脉轮人物原型报告')).toBeInTheDocument()
    expectSinglePageLandmarks()

    fireEvent.click(screen.getByRole('button', { name: '顶部重新测试' }))
    expect(callbacks.restart).toHaveBeenCalledOnce()
  })

  it('result 缺少数据时显示可恢复错误，不抛错或伪造结果', () => {
    const { callbacks, session } = createSession({ pageState: 'result', result: null })

    renderHome(session)

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('结果数据暂时无法读取')
    expect(within(alert).getByRole('button', { name: '返回首页' })).toBeInTheDocument()
    expect(screen.queryByText('老好人')).not.toBeInTheDocument()
    expectSinglePageLandmarks()

    fireEvent.click(within(alert).getByRole('button', { name: '返回首页' }))
    expect(callbacks.restart).toHaveBeenCalledOnce()
  })
})
