import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import postcss from 'postcss'
import { optionLabels, questions } from '@/lib/chakra-data'
import { QuestionPage } from './question-page'

function createCallbacks() {
  return {
    onSelectAnswer: vi.fn(),
    onGoToQuestion: vi.fn(),
    onSaveAndExit: vi.fn(),
    onSubmit: vi.fn(),
  }
}

function renderQuestionPage(
  overrides: Partial<React.ComponentProps<typeof QuestionPage>> = {}
) {
  const callbacks = createCallbacks()
  const props: React.ComponentProps<typeof QuestionPage> = {
    currentQuestion: 0,
    answers: {},
    backupStatus: 'idle',
    storageWarning: null,
    ...callbacks,
    ...overrides,
  }

  return {
    ...render(<QuestionPage {...props} />),
    callbacks,
    props,
  }
}

async function flushRadixFocus() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
}

afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
})

describe('QuestionPage 语义与键盘操作', () => {
  it('所有移动宽度的底栏都让保存状态与操作分行，375×667 隐藏非关键英文', () => {
    const stylesheet = postcss.parse(
      readFileSync(resolve(process.cwd(), 'src/app/globals.css'), 'utf8')
    )
    let footerDirection = ''
    let footerAlignment = ''
    let lowHeightChapterDisplay = ''

    stylesheet.walkAtRules('media', (media) => {
      if (media.params === '(max-width: 767px)') {
        media.walkRules('.question-page__footer', (rule) => {
          rule.walkDecls('flex-direction', (declaration) => {
            footerDirection = declaration.value
          })
          rule.walkDecls('align-items', (declaration) => {
            footerAlignment = declaration.value
          })
        })
      }
      if (media.params.includes('max-width: 767px') && media.params.includes('max-height: 667px')) {
        media.walkRules('.question-page__chapter span:first-child', (rule) => {
          rule.walkDecls('display', (declaration) => {
            lowHeightChapterDisplay = declaration.value
          })
        })
      }
    })

    expect(footerDirection).toBe('column')
    expect(footerAlignment).toBe('stretch')
    expect(lowHeightChapterDisplay).toBe('none')
  })

  it.each([
    [0, 'var(--chakra-root)'],
    [8, 'var(--chakra-solar)'],
    [16, 'var(--chakra-sacral)'],
  ] as const)('第 %i 题使用对应的脉轮主题令牌', (currentQuestion, expectedColor) => {
    const { container } = renderQuestionPage({ currentQuestion })

    expect(container.querySelector('.question-page')).toHaveStyle({
      '--chakra-current': expectedColor,
    })
  })

  it('首题显示唯一题目标题、进度、轮组和五档真实单选项', () => {
    renderQuestionPage()

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(questions[0].text)
    expect(screen.getByText('问题 1 / 56')).toBeInTheDocument()
    expect(screen.getByText('2%')).toBeInTheDocument()
    expect(screen.getByText('海底轮 · Root Chakra')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: '答题进度' })).toHaveAttribute('value', '1')
    expect(screen.getAllByRole('radio')).toHaveLength(5)

    optionLabels.forEach((label) => {
      expect(screen.getByRole('radio', { name: label })).toBeInTheDocument()
    })
  })

  it('已答选项保持选中标记并决定下一题是否可用', () => {
    const { rerender, props } = renderQuestionPage()

    expect(screen.getByRole('button', { name: '下一题' })).toBeDisabled()

    rerender(<QuestionPage {...props} answers={{ 1: 2 }} />)

    expect(screen.getByRole('radio', { name: optionLabels[2] })).toBeChecked()
    expect(screen.getByText('已选择')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '下一题' })).toBeEnabled()
  })

  it('只在当前题是第一遗漏时显示剩余题数', () => {
    const { rerender, props } = renderQuestionPage({ currentQuestion: 2, answers: { 1: 0, 2: 1 } })

    expect(screen.getByRole('status')).toHaveTextContent('还有 54 题未完成')

    rerender(<QuestionPage {...props} currentQuestion={3} answers={{ 1: 0, 3: 1 }} />)

    expect(screen.queryByText(/题未完成/)).not.toBeInTheDocument()
  })

  it('选答到自动前进期间复用剩余题数状态节点', () => {
    const { rerender, props } = renderQuestionPage()
    const status = screen.getByRole('status')

    rerender(<QuestionPage {...props} answers={{ 1: 0 }} />)

    expect(screen.getByRole('status')).toBe(status)
    expect(status).toHaveTextContent('还有 55 题未完成')

    rerender(<QuestionPage {...props} currentQuestion={1} answers={{ 1: 0 }} />)

    expect(screen.getByRole('status')).toBe(status)
  })

  it('回看已答题且下一题也已答时隐藏剩余题数', () => {
    renderQuestionPage({ answers: { 1: 0, 2: 1 } })

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('切换题目时复用答题区节点，避免重复播放进场动画', () => {
    const { container, rerender, props } = renderQuestionPage({ answers: { 1: 0 } })
    const questionSection = container.querySelector('.question-page__question')

    rerender(<QuestionPage {...props} currentQuestion={1} answers={{ 1: 0 }} />)

    expect(container.querySelector('.question-page__question')).toBe(questionSection)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(questions[1].text)
  })

  it('保存不可用时显示原警告、退出文案和丢失提醒', () => {
    renderQuestionPage({ storageWarning: '当前设备无法保存进度' })

    expect(screen.getByRole('alert')).toHaveTextContent('当前设备无法保存进度')
    expect(screen.getByRole('button', { name: '退出测试' })).toBeInTheDocument()
    expect(screen.getByText('关闭页面后本次进度可能丢失')).toBeInTheDocument()
  })

  it('方向键通过真实 RadioGroup 保存答案，但等待一秒也不自动前进', async () => {
    const user = userEvent.setup()
    const { callbacks } = renderQuestionPage({ answers: { 1: 0 } })
    const firstOption = screen.getByRole('radio', { name: optionLabels[0] })

    act(() => firstOption.focus())
    await flushRadixFocus()
    await user.keyboard('{ArrowRight>}')
    await flushRadixFocus()
    await user.keyboard('{/ArrowRight}')

    expect(screen.getByRole('radio', { name: optionLabels[1] })).toHaveFocus()
    expect(callbacks.onSelectAnswer).toHaveBeenCalledWith(1, 1)

    vi.useFakeTimers()
    act(() => vi.advanceTimersByTime(1000))

    expect(callbacks.onGoToQuestion).not.toHaveBeenCalled()
  })

  it('空格通过真实 RadioGroup 保存答案，但等待一秒也不自动前进', async () => {
    const user = userEvent.setup()
    const { callbacks } = renderQuestionPage({ answers: { 1: 0 } })
    const thirdOption = screen.getByRole('radio', { name: optionLabels[2] })

    thirdOption.focus()
    await user.keyboard(' ')

    expect(callbacks.onSelectAnswer).toHaveBeenCalledWith(1, 2)

    vi.useFakeTimers()
    act(() => vi.advanceTimersByTime(1000))

    expect(callbacks.onGoToQuestion).not.toHaveBeenCalled()
  })

  it('切换题目后可直接用方向键选择答案', async () => {
    const user = userEvent.setup()
    const { callbacks, rerender, props } = renderQuestionPage()

    rerender(<QuestionPage {...props} currentQuestion={1} />)
    await flushRadixFocus()

    expect(screen.getByRole('radio', { name: optionLabels[0] })).toHaveFocus()

    await user.keyboard('{ArrowRight>}')
    await flushRadixFocus()
    await user.keyboard('{/ArrowRight}')

    expect(screen.getByRole('radio', { name: optionLabels[1] })).toHaveFocus()
    expect(callbacks.onSelectAnswer).toHaveBeenCalledWith(2, 1)
  })

  it('返回已答题时聚焦已选答案', async () => {
    const { rerender, props } = renderQuestionPage()

    rerender(<QuestionPage {...props} currentQuestion={1} answers={{ 2: 3 }} />)
    await flushRadixFocus()

    expect(screen.getByRole('radio', { name: optionLabels[3] })).toHaveFocus()
  })

  it('答案单选组用题干作为可访问名称', () => {
    renderQuestionPage()

    expect(screen.getByRole('radiogroup', { name: questions[0].text })).toBeInTheDocument()
  })

  it('已答题在答案选项上按 Enter 进入下一题', async () => {
    const user = userEvent.setup()
    const { callbacks } = renderQuestionPage({ answers: { 1: 2 } })

    expect(screen.getByRole('radio', { name: optionLabels[2] })).toHaveFocus()

    await user.keyboard('{Enter}')

    expect(callbacks.onGoToQuestion).toHaveBeenCalledOnce()
    expect(callbacks.onGoToQuestion).toHaveBeenCalledWith(1)
    expect(callbacks.onSubmit).not.toHaveBeenCalled()
  })

  it('未答题在答案选项上按 Enter 不会前进', async () => {
    const user = userEvent.setup()
    const { callbacks } = renderQuestionPage()

    await user.keyboard('{Enter}')

    expect(callbacks.onGoToQuestion).not.toHaveBeenCalled()
    expect(callbacks.onSubmit).not.toHaveBeenCalled()
  })

  it('末题已答时在答案选项上按 Enter 查看结果', async () => {
    const user = userEvent.setup()
    const { callbacks } = renderQuestionPage({ currentQuestion: 55, answers: { 56: 4 } })

    await user.keyboard('{Enter}')

    expect(callbacks.onSubmit).toHaveBeenCalledOnce()
    expect(callbacks.onGoToQuestion).not.toHaveBeenCalled()
  })

  it('切换题目后聚焦首个选项，并用独立 live region 播报题号', () => {
    const { rerender, props } = renderQuestionPage()

    rerender(<QuestionPage {...props} currentQuestion={1} />)

    expect(screen.getByRole('radio', { name: optionLabels[0] })).toHaveFocus()
    expect(screen.getByText('第 2 题，共 56 题')).toHaveAttribute('aria-live', 'polite')
  })

  it('末题已答时只提交结果，不导航到题目范围之外', async () => {
    const user = userEvent.setup()
    const { callbacks } = renderQuestionPage({ currentQuestion: 55, answers: { 56: 4 } })

    await user.click(screen.getByRole('button', { name: '查看结果' }))

    expect(callbacks.onSubmit).toHaveBeenCalledOnce()
    expect(callbacks.onGoToQuestion).not.toHaveBeenCalled()
  })
})

describe('QuestionPage pointer 自动前进与取消', () => {
  it('pointer 自动前进等待期间按 Enter 只前进一次', () => {
    vi.useFakeTimers()
    const { callbacks } = renderQuestionPage({ answers: { 1: 0 } })
    const firstOption = screen.getByRole('radio', { name: optionLabels[0] })

    fireEvent.pointerUp(firstOption.closest('label')!, { pointerType: 'mouse' })
    fireEvent.keyDown(firstOption, { key: 'Enter', code: 'Enter' })

    expect(callbacks.onGoToQuestion).toHaveBeenCalledOnce()
    expect(callbacks.onGoToQuestion).toHaveBeenCalledWith(1)

    act(() => vi.advanceTimersByTime(250))

    expect(callbacks.onGoToQuestion).toHaveBeenCalledOnce()
  })

  it('直接命中 RadioGroupItem 时同步保存，249ms 不前进，250ms 前进一题', () => {
    vi.useFakeTimers()
    const { callbacks } = renderQuestionPage()
    const option = screen.getByRole('radio', { name: optionLabels[0] })

    fireEvent.pointerUp(option, { pointerType: 'mouse' })

    expect(callbacks.onSelectAnswer).toHaveBeenCalledWith(1, 0)
    expect(callbacks.onGoToQuestion).not.toHaveBeenCalled()

    act(() => vi.advanceTimersByTime(249))
    expect(callbacks.onGoToQuestion).not.toHaveBeenCalled()

    act(() => vi.advanceTimersByTime(1))
    expect(callbacks.onGoToQuestion).toHaveBeenCalledWith(1)
  })

  it('直接命中选项文字时同步保存，249ms 不前进，250ms 前进一题', () => {
    vi.useFakeTimers()
    const { callbacks } = renderQuestionPage()

    fireEvent.pointerUp(screen.getByText(optionLabels[1]), { pointerType: 'mouse' })

    expect(callbacks.onSelectAnswer).toHaveBeenCalledWith(1, 1)
    expect(callbacks.onGoToQuestion).not.toHaveBeenCalled()

    act(() => vi.advanceTimersByTime(249))
    expect(callbacks.onGoToQuestion).not.toHaveBeenCalled()

    act(() => vi.advanceTimersByTime(1))
    expect(callbacks.onGoToQuestion).toHaveBeenCalledWith(1)
  })

  it.each(['touch', 'pen'] as const)('%s pointer 在 250ms 后自动前进', (pointerType) => {
    vi.useFakeTimers()
    const { callbacks } = renderQuestionPage()
    const option = screen.getByRole('radio', { name: optionLabels[1] }).closest('label')

    fireEvent.pointerUp(option!, { pointerType })
    act(() => vi.advanceTimersByTime(250))

    expect(callbacks.onSelectAnswer).toHaveBeenCalledWith(1, 1)
    expect(callbacks.onGoToQuestion).toHaveBeenCalledWith(1)
  })

  it('pointer 后紧邻的 Radix 同值变更只保存一次', () => {
    vi.useFakeTimers()
    const { callbacks } = renderQuestionPage()
    const option = screen.getByRole('radio', { name: optionLabels[3] })

    fireEvent.pointerUp(option.closest('label')!, { pointerType: 'mouse' })
    fireEvent.click(option)

    expect(callbacks.onSelectAnswer).toHaveBeenCalledTimes(1)
    expect(callbacks.onSelectAnswer).toHaveBeenCalledWith(1, 3)
  })

  it('紧邻同值跳过一次后，不吞掉以后真实的键盘同值选择', async () => {
    const user = userEvent.setup()
    const { callbacks } = renderQuestionPage()
    const fourthOption = screen.getByRole('radio', { name: optionLabels[3] })

    fireEvent.pointerUp(fourthOption.closest('label')!, { pointerType: 'mouse' })
    fireEvent.click(fourthOption)
    const thirdOption = screen.getByRole('radio', { name: optionLabels[2] })
    act(() => thirdOption.focus())
    await user.keyboard(' ')
    act(() => fourthOption.focus())
    await user.keyboard(' ')

    expect(callbacks.onSelectAnswer).toHaveBeenLastCalledWith(1, 3)
    expect(callbacks.onSelectAnswer).toHaveBeenCalledTimes(3)
  })

  it('计时期间重新 pointer 选择只保留最后一个 timer', () => {
    vi.useFakeTimers()
    const { callbacks } = renderQuestionPage()
    const first = screen.getByRole('radio', { name: optionLabels[0] }).closest('label')
    const second = screen.getByRole('radio', { name: optionLabels[1] }).closest('label')

    fireEvent.pointerUp(first!, { pointerType: 'mouse' })
    act(() => vi.advanceTimersByTime(200))
    fireEvent.pointerUp(second!, { pointerType: 'mouse' })
    act(() => vi.advanceTimersByTime(249))

    expect(callbacks.onGoToQuestion).not.toHaveBeenCalled()

    act(() => vi.advanceTimersByTime(1))
    expect(callbacks.onGoToQuestion).toHaveBeenCalledTimes(1)
    expect(callbacks.onGoToQuestion).toHaveBeenCalledWith(1)
  })

  it.each([
    ['上一题', '上一题'],
    ['下一题', '下一题'],
    ['暂存并退出', '暂存并退出'],
  ] as const)('点击%s会取消待执行的自动前进', (_name, buttonName) => {
    vi.useFakeTimers()
    const callbacks = createCallbacks()
    renderQuestionPage({
      currentQuestion: 1,
      answers: { 2: 0 },
      ...callbacks,
    })

    fireEvent.pointerUp(
      screen.getByRole('radio', { name: optionLabels[1] }).closest('label')!,
      { pointerType: 'mouse' }
    )
    fireEvent.click(screen.getByRole('button', { name: buttonName }))
    act(() => vi.advanceTimersByTime(250))

    if (buttonName === '上一题') expect(callbacks.onGoToQuestion).toHaveBeenCalledWith(0)
    if (buttonName === '下一题') expect(callbacks.onGoToQuestion).toHaveBeenCalledWith(2)
    if (buttonName === '暂存并退出') expect(callbacks.onSaveAndExit).toHaveBeenCalledOnce()
    expect(callbacks.onGoToQuestion).not.toHaveBeenCalledWith(2 - Number(buttonName === '下一题'))
    expect(callbacks.onGoToQuestion).toHaveBeenCalledTimes(buttonName === '暂存并退出' ? 0 : 1)
  })

  it('storage warning 下的退出操作也取消待执行的自动前进', () => {
    vi.useFakeTimers()
    const { callbacks } = renderQuestionPage({ storageWarning: '当前设备无法保存进度' })

    fireEvent.pointerUp(
      screen.getByRole('radio', { name: optionLabels[0] }).closest('label')!,
      { pointerType: 'touch' }
    )
    fireEvent.click(screen.getByRole('button', { name: '退出测试' }))
    act(() => vi.advanceTimersByTime(250))

    expect(callbacks.onSaveAndExit).toHaveBeenCalledOnce()
    expect(callbacks.onGoToQuestion).not.toHaveBeenCalled()
  })

  it('rerender 到新题会取消旧题的自动前进并聚焦首个选项', () => {
    vi.useFakeTimers()
    const { callbacks, rerender, props } = renderQuestionPage()

    fireEvent.pointerUp(
      screen.getByRole('radio', { name: optionLabels[0] }).closest('label')!,
      { pointerType: 'pen' }
    )
    rerender(<QuestionPage {...props} currentQuestion={1} />)
    act(() => vi.advanceTimersByTime(250))

    expect(callbacks.onGoToQuestion).not.toHaveBeenCalled()
    expect(screen.getByRole('radio', { name: optionLabels[0] })).toHaveFocus()
  })

  it('unmount 后推进时间不会调用自动前进', () => {
    vi.useFakeTimers()
    const { callbacks, unmount } = renderQuestionPage()

    fireEvent.pointerUp(
      screen.getByRole('radio', { name: optionLabels[0] }).closest('label')!,
      { pointerType: 'mouse' }
    )
    unmount()
    act(() => vi.advanceTimersByTime(250))

    expect(callbacks.onGoToQuestion).not.toHaveBeenCalled()
  })

  it('末题 pointer 只保存，不自动前进也不自动提交', () => {
    vi.useFakeTimers()
    const { callbacks } = renderQuestionPage({ currentQuestion: 55 })

    fireEvent.pointerUp(
      screen.getByRole('radio', { name: optionLabels[4] }).closest('label')!,
      { pointerType: 'mouse' }
    )
    act(() => vi.advanceTimersByTime(1000))

    expect(callbacks.onSelectAnswer).toHaveBeenCalledWith(56, 4)
    expect(callbacks.onGoToQuestion).not.toHaveBeenCalled()
    expect(callbacks.onSubmit).not.toHaveBeenCalled()
  })

  it('查看结果前清理计时器且只提交一次', () => {
    vi.useFakeTimers()
    const callbacks = createCallbacks()
    const { rerender, props } = renderQuestionPage({ ...callbacks })

    fireEvent.pointerUp(
      screen.getByRole('radio', { name: optionLabels[0] }).closest('label')!,
      { pointerType: 'mouse' }
    )
    rerender(<QuestionPage {...props} {...callbacks} currentQuestion={55} answers={{ 56: 0 }} />)
    fireEvent.click(screen.getByRole('button', { name: '查看结果' }))
    act(() => vi.advanceTimersByTime(250))

    expect(callbacks.onSubmit).toHaveBeenCalledOnce()
    expect(callbacks.onGoToQuestion).not.toHaveBeenCalled()
  })
})
