import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from './theme-provider'
import { WelcomePage } from './welcome-page'

function renderWelcomePage(props: React.ComponentProps<typeof WelcomePage>) {
  return render(
    <ThemeProvider>
      <WelcomePage {...props} />
    </ThemeProvider>
  )
}

function createCallbacks() {
  return {
    onStart: vi.fn(),
    onContinue: vi.fn(),
    onRestart: vi.fn(),
  }
}

afterEach(() => {
  vi.restoreAllMocks()
  window.localStorage.clear()
  document.documentElement.className = ''
  document.documentElement.style.colorScheme = ''
})

describe('WelcomePage', () => {
  it('新用户只显示开始测试主操作并触发开始回调', async () => {
    const user = userEvent.setup()
    const callbacks = createCallbacks()

    renderWelcomePage({
      progressInfo: { answered: 0, total: 56, percentage: 0, completed: false },
      ...callbacks,
    })

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('button', { name: '开始测试' })).toHaveAttribute(
      'data-variant',
      'primary'
    )
    expect(screen.queryByRole('button', { name: '继续测试' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '重新开始' })).not.toBeInTheDocument()
    expect(screen.getByText('56 道题 · 约 8 分钟 · 结果仅作自我探索参考')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '开始测试' }))

    expect(callbacks.onStart).toHaveBeenCalledOnce()
  })

  it('24题续答显示进度并触发继续回调', async () => {
    const user = userEvent.setup()
    const callbacks = createCallbacks()

    renderWelcomePage({
      progressInfo: { answered: 24, total: 56, percentage: 43, completed: false },
      ...callbacks,
    })

    expect(screen.getByText('发现未完成的测试')).toBeInTheDocument()
    expect(screen.getByText(/已完成 24\/56 题（43%）/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '继续测试' })).toHaveAttribute(
      'data-variant',
      'primary'
    )
    expect(screen.getAllByRole('button', { name: '继续测试' })).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: '继续测试' }))

    expect(callbacks.onContinue).toHaveBeenCalledOnce()
  })

  it.each([
    { answered: 24, total: 56, percentage: 43, completed: false },
    { answered: 56, total: 56, percentage: 100, completed: true },
  ] as const)('有进度时重新开始先说明本地进度会被清除，取消则保留进度', async (progressInfo) => {
    const user = userEvent.setup()
    const callbacks = createCallbacks()
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)

    renderWelcomePage({ progressInfo, ...callbacks })

    await user.click(screen.getByRole('button', { name: '重新开始' }))

    expect(confirm).toHaveBeenCalledWith('这会清除当前设备上的答题进度。是否重新开始？')
    expect(callbacks.onRestart).not.toHaveBeenCalled()
  })

  it('确认清除当前设备答题进度后才重新开始', async () => {
    const user = userEvent.setup()
    const callbacks = createCallbacks()
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    renderWelcomePage({
      progressInfo: { answered: 24, total: 56, percentage: 43, completed: false },
      ...callbacks,
    })

    await user.click(screen.getByRole('button', { name: '重新开始' }))

    expect(callbacks.onRestart).toHaveBeenCalledOnce()
  })

  it('56题完成待查看结果时继续操作仍调用继续回调', async () => {
    const user = userEvent.setup()
    const callbacks = createCallbacks()

    renderWelcomePage({
      progressInfo: { answered: 56, total: 56, percentage: 100, completed: true },
      ...callbacks,
    })

    expect(screen.getByText('答案已完成，待查看结果')).toBeInTheDocument()
    expect(screen.getByText(/已完成 56\/56 题（100%）/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '查看结果' })).toHaveAttribute(
      'data-variant',
      'primary'
    )

    await user.click(screen.getByRole('button', { name: '查看结果' }))

    expect(callbacks.onContinue).toHaveBeenCalledOnce()
  })

  it('提供原生说明入口和三项可读说明', () => {
    const callbacks = createCallbacks()

    renderWelcomePage({
      progressInfo: { answered: 0, total: 56, percentage: 0, completed: false },
      ...callbacks,
    })

    const details = screen.getByText('测试如何进行').closest('details')

    expect(details).toBeInTheDocument()
    expect(details?.querySelector('summary')).toHaveTextContent('测试如何进行')
    expect(screen.getByText('请按真实感受作答。')).toBeInTheDocument()
    expect(screen.getByText('可在同一设备上继续答题。')).toBeInTheDocument()
    expect(screen.getByText('结果描述当前能量，而非永久人格。')).toBeInTheDocument()
  })

  it('通过真实外壳提供品牌、标签、主题切换和装饰语义', () => {
    const callbacks = createCallbacks()

    renderWelcomePage({
      progressInfo: { answered: 0, total: 56, percentage: 0, completed: false },
      ...callbacks,
    })

    expect(screen.getByRole('navigation', { name: '主要导航' })).toBeInTheDocument()
    expect(screen.getByText('圆圆如意')).toBeInTheDocument()
    expect(screen.getByText('Chakra Archetype Test')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '切换到深色模式' })).toBeInTheDocument()
    expect(document.querySelector('[aria-hidden="true"]')).toHaveClass('chakra-orbit')
  })
})
