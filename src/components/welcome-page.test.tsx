import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import postcss from 'postcss'
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
    expect(screen.getByText('沿着七种能量线索，读出你此刻的主导力量、辅助风格与成长课题。')).toBeInTheDocument()
    expect(screen.getByText('56 道题')).toBeInTheDocument()
    expect(screen.getByText('约 5–10 分钟')).toBeInTheDocument()
    expect(screen.getByText('可中途续答')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '开始测试' }))

    expect(callbacks.onStart).toHaveBeenCalledOnce()
  })

  it('24题续答显示进度并触发继续回调', async () => {
    const user = userEvent.setup()
    const callbacks = createCallbacks()

    const { container } = renderWelcomePage({
      progressInfo: { answered: 24, total: 56, percentage: 43, completed: false },
      ...callbacks,
    })

    expect(screen.getByText('继续上一次探索')).toBeInTheDocument()
    expect(screen.getByText('已完成 24 / 56 题 · 进度仅保存在当前设备')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '继续测试' })).toHaveAttribute(
      'data-variant',
      'primary'
    )
    expect(screen.getAllByRole('button', { name: '继续测试' })).toHaveLength(1)
    const resumeRegion = screen.getByRole('region', { name: '上次测试进度' })
    expect(resumeRegion).toContainElement(screen.getByRole('button', { name: '继续测试' }))
    expect(container.querySelector('.welcome-page__content')).not.toContainElement(
      screen.getByRole('button', { name: '继续测试' })
    )

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

  it('56题完成待查看结果时用继续测试进入末题，不冒充直接展示结果', async () => {
    const user = userEvent.setup()
    const callbacks = createCallbacks()

    renderWelcomePage({
      progressInfo: { answered: 56, total: 56, percentage: 100, completed: true },
      ...callbacks,
    })

    expect(screen.getByText('答案已完成，待查看结果')).toBeInTheDocument()
    expect(screen.getByText('已完成 56 / 56 题 · 进度仅保存在当前设备')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '继续测试' })).toHaveAttribute(
      'data-variant',
      'primary'
    )
    expect(screen.queryByRole('button', { name: '查看结果' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '继续测试' }))

    expect(callbacks.onContinue).toHaveBeenCalledOnce()
  })

  it('提供原生说明入口和固定的题量、用时、续答及用途说明', () => {
    const callbacks = createCallbacks()

    renderWelcomePage({
      progressInfo: { answered: 0, total: 56, percentage: 0, completed: false },
      ...callbacks,
    })

    const details = screen.getByText('测试如何进行').closest('details')

    expect(details).toBeInTheDocument()
    expect(details?.querySelector('summary')).toHaveTextContent('测试如何进行')
    expect(screen.getByText('共 56 道题，请按真实感受作答。')).toBeInTheDocument()
    expect(screen.getByText('预计用时 5–10 分钟。')).toBeInTheDocument()
    expect(screen.getByText('答题进度仅保存在当前设备，可中途续答。')).toBeInTheDocument()
    expect(screen.getByText('结果仅用于自我探索，不构成医学或心理诊断。')).toBeInTheDocument()
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
    const column = document.querySelector('.chakra-column')
    expect(column).toHaveAttribute('aria-hidden', 'true')
    expect(column?.querySelectorAll('.chakra-column__node')).toHaveLength(7)
    expect(column?.querySelectorAll('.chakra-column__channel')).toHaveLength(2)
    expect(column?.querySelectorAll('.chakra-column__spark')).toHaveLength(1)
    expect(column).toHaveTextContent('')
  })

  it('七个脉轮自海底轮到顶轮沿中轴自下而上排列且不会被裁切', () => {
    const callbacks = createCallbacks()
    const order = ['root', 'sacral', 'solar', 'heart', 'throat', 'third-eye', 'crown']

    renderWelcomePage({
      progressInfo: { answered: 0, total: 56, percentage: 0, completed: false },
      ...callbacks,
    })

    const svg = document.querySelector('.chakra-column')
    const axis = svg?.querySelector('.chakra-column__axis')
    const viewBox = svg?.getAttribute('viewBox')?.split(' ').map(Number)
    const cores = order.map((name) =>
      svg?.querySelector(`.chakra-column__node--${name} .chakra-column__node-core`)
    )

    if (!viewBox || viewBox.length !== 4 || !axis) throw new Error('脉轮图缺少有效的几何定义')
    const [viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight] = viewBox
    const axisX = Number(axis.getAttribute('x1'))
    const ys = cores.map((core) => Number(core?.getAttribute('cy')))

    cores.forEach((core) => {
      expect(core?.tagName).toBe('circle')
      expect(Number(core?.getAttribute('cx'))).toBe(axisX)
    })
    ys.slice(1).forEach((y, i) => expect(y).toBeLessThan(ys[i]))

    svg?.querySelectorAll('.chakra-column__node circle').forEach((circle) => {
      const cx = Number(circle.getAttribute('cx'))
      const cy = Number(circle.getAttribute('cy'))
      const r = Number(circle.getAttribute('r'))
      expect(cx - r).toBeGreaterThanOrEqual(viewBoxX)
      expect(cy - r).toBeGreaterThanOrEqual(viewBoxY)
      expect(cx + r).toBeLessThanOrEqual(viewBoxX + viewBoxWidth)
      expect(cy + r).toBeLessThanOrEqual(viewBoxY + viewBoxHeight)
    })
  })

  it('减少动态效果偏好下停用脉轮动画', () => {
    const stylesheet = postcss.parse(
      readFileSync(resolve(process.cwd(), 'src/app/globals.css'), 'utf8')
    )
    const reducedSelectors: string[] = []

    stylesheet.walkAtRules('media', (atRule) => {
      if (!atRule.params.includes('prefers-reduced-motion')) return
      atRule.walkRules((rule) => {
        rule.walkDecls('animation', (decl) => {
          if (decl.value === 'none') reducedSelectors.push(...rule.selectors)
        })
      })
    })

    expect(reducedSelectors).toContain('.chakra-column *')
  })

  it('欢迎页主操作具有约 160x56 的醒目点击尺寸', () => {
    const stylesheet = postcss.parse(
      readFileSync(resolve(process.cwd(), 'src/app/globals.css'), 'utf8')
    )
    const declarations = new Map<string, string>()

    stylesheet.walkRules('.welcome-page__primary-action', (rule) => {
      if (rule.parent?.type !== 'root') return

      rule.walkDecls((declaration) => {
        declarations.set(declaration.prop, declaration.value)
      })
    })

    expect(declarations.get('width')).toBe('10rem')
    expect(declarations.get('max-width')).toBe('100%')
    expect(declarations.get('min-height')).toBe('3.5rem')
    expect(declarations.get('font-size')).toBe('1.125rem')
  })
})
