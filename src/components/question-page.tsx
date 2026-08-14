'use client'

import * as React from 'react'
import { Check } from 'lucide-react'
import { chakras, optionLabels, questions } from '@/lib/chakra-data'
import type { Answers } from '@/lib/test-session'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const TOTAL_QUESTIONS = 56
const AUTO_ADVANCE_DELAY = 250
const POINTER_TYPES = new Set(['mouse', 'touch', 'pen'])
const CHAKRA_THEME_COLORS = {
  1: 'var(--chakra-root)',
  2: 'var(--chakra-solar)',
  3: 'var(--chakra-sacral)',
  4: 'var(--chakra-heart)',
  5: 'var(--chakra-throat)',
  6: 'var(--chakra-third-eye)',
  7: 'var(--chakra-crown)',
} as const

export function QuestionPage({
  currentQuestion,
  answers,
  backupStatus: _backupStatus,
  storageWarning,
  onSelectAnswer,
  onGoToQuestion,
  onSaveAndExit,
  onSubmit,
}: {
  currentQuestion: number
  answers: Answers
  backupStatus: 'idle' | 'saving' | 'saved' | 'failed'
  storageWarning: string | null
  onSelectAnswer(questionId: number, answerIndex: number): void
  onGoToQuestion(index: number): void
  onSaveAndExit(): void
  onSubmit(): void
}): React.ReactNode {
  const question = questions[currentQuestion]
  const chakra = chakras.find(
    (item) => question.id >= item.startQuestion && question.id <= item.endQuestion
  )!
  const selectedAnswer = answers[question.id]
  const answeredCount = Object.keys(answers).length
  const percentage = Math.round(((currentQuestion + 1) / TOTAL_QUESTIONS) * 100)
  const answerGroupRef = React.useRef<HTMLDivElement>(null)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const pointerValueRef = React.useRef<string | null>(null)

  const clearAutoAdvance = React.useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  React.useEffect(() => {
    clearAutoAdvance()
    pointerValueRef.current = null

    return clearAutoAdvance
  }, [clearAutoAdvance, currentQuestion])

  React.useLayoutEffect(() => {
    const selectedOption = answerGroupRef.current?.querySelector<HTMLButtonElement>(
      '[role="radio"][aria-checked="true"]'
    )
    const firstOption = answerGroupRef.current?.querySelector<HTMLButtonElement>('[role="radio"]')
    const focusTarget = selectedOption ?? firstOption

    focusTarget?.focus()
  }, [currentQuestion])

  const handleValueChange = (value: string) => {
    if (pointerValueRef.current === value) {
      pointerValueRef.current = null
      return
    }

    pointerValueRef.current = null
    onSelectAnswer(question.id, Number(value))
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLLabelElement>, value: string) => {
    if (!POINTER_TYPES.has(event.pointerType)) return

    clearAutoAdvance()
    pointerValueRef.current = value
    onSelectAnswer(question.id, Number(value))

    if (currentQuestion === TOTAL_QUESTIONS - 1) return

    timerRef.current = setTimeout(() => {
      timerRef.current = null
      onGoToQuestion(currentQuestion + 1)
    }, AUTO_ADVANCE_DELAY)
  }

  const goToQuestion = (index: number) => {
    clearAutoAdvance()
    onGoToQuestion(index)
  }

  const saveAndExit = () => {
    clearAutoAdvance()
    onSaveAndExit()
  }

  const submit = () => {
    clearAutoAdvance()
    onSubmit()
  }

  const allPreviousQuestionsAreAnswered = Array.from(
    { length: currentQuestion },
    (_, index) => answers[index + 1] !== undefined
  ).every(Boolean)
  const nextQuestion = questions[currentQuestion + 1]
  const nextQuestionIsMissing = nextQuestion !== undefined
    && answers[nextQuestion.id] === undefined
  const showMissingStatus = answeredCount < TOTAL_QUESTIONS
    && allPreviousQuestionsAreAnswered
    && (selectedAnswer === undefined || nextQuestionIsMissing)
  const titleId = `question-${question.id}-title`
  const style = {
    '--chakra-current': CHAKRA_THEME_COLORS[chakra.id as keyof typeof CHAKRA_THEME_COLORS],
  } as React.CSSProperties

  return (
    <article className="question-page" style={style}>
      <div className="question-page__scene-action">
        <button className="question-page__exit md:hidden" type="button" onClick={saveAndExit}>
          {storageWarning ? '退出测试' : '暂存并退出'}
        </button>
        {storageWarning && (
          <span className="question-page__exit-warning">关闭页面后本次进度可能丢失</span>
        )}
      </div>

      <div className="question-page__progress-copy">
        <span>{chakra.name} · {chakra.englishName}</span>
        <span>问题 {currentQuestion + 1} / 56</span>
        <span>{percentage}%</span>
      </div>
      <progress
        className="question-page__progress"
        aria-label="答题进度"
        max={TOTAL_QUESTIONS}
        value={currentQuestion + 1}
      />

      <div className="question-page__chapter">
        <span>Chapter {String(chakra.id).padStart(2, '0')} · {chakra.englishName}</span>
        <span>{chakra.description}</span>
      </div>

      <p className="question-page__missing" hidden={!showMissingStatus} role="status">
        {showMissingStatus ? `还有 ${TOTAL_QUESTIONS - answeredCount} 题未完成` : null}
      </p>

      <section className="question-page__question">
        <p className="question-page__number">问题 {currentQuestion + 1}</p>
        <h1 className="question-page__title" id={titleId}>
          {question.text}
        </h1>

        <RadioGroup
          ref={answerGroupRef}
          className="question-page__answers"
          aria-labelledby={titleId}
          value={selectedAnswer === undefined ? null : String(selectedAnswer)}
          onKeyDown={(event) => {
            pointerValueRef.current = null

            if (event.key !== 'Enter' || selectedAnswer === undefined) return

            event.preventDefault()

            if (currentQuestion === TOTAL_QUESTIONS - 1) {
              submit()
              return
            }

            goToQuestion(currentQuestion + 1)
          }}
          onValueChange={handleValueChange}
        >
          {optionLabels.map((label, index) => {
            const value = String(index)
            const selected = selectedAnswer === index
            const id = `question-${question.id}-answer-${value}`

            return (
              <label
                className="answer-option"
                data-selected={selected || undefined}
                htmlFor={id}
                key={value}
                onPointerUp={(event) => handlePointerUp(event, value)}
              >
                <span className="answer-option__index" aria-hidden="true">
                  {index + 1}
                </span>
                <RadioGroupItem id={id} value={value} />
                <span className="answer-option__label">{label}</span>
                {selected && (
                  <span className="answer-option__selected" aria-hidden="true">
                    <Check aria-hidden="true" size={16} />
                    已选择
                  </span>
                )}
              </label>
            )
          })}
        </RadioGroup>
      </section>

      <p className="question-page__keyboard-hint">
        键盘可用方向键或空格选择，按 Enter 进入下一题
      </p>
      <span className="sr-only" aria-live="polite">
        第 {currentQuestion + 1} 题，共 56 题
      </span>

      <footer className="question-page__footer">
        <div className="question-page__save-state">
          {storageWarning ? (
            <p role="alert">{storageWarning}</p>
          ) : (
            <p>答案已保存到当前设备</p>
          )}
        </div>
        <div className="question-actions">
          <button
            className="question-actions__secondary"
            disabled={currentQuestion === 0}
            type="button"
            onClick={() => goToQuestion(currentQuestion - 1)}
          >
            上一题
          </button>
          {currentQuestion === TOTAL_QUESTIONS - 1 ? (
            <button
              className="question-actions__primary"
              disabled={selectedAnswer === undefined}
              type="button"
              onClick={submit}
            >
              查看结果
            </button>
          ) : (
            <button
              className="question-actions__primary"
              disabled={selectedAnswer === undefined}
              type="button"
              onClick={() => goToQuestion(currentQuestion + 1)}
            >
              下一题
            </button>
          )}
        </div>
      </footer>
    </article>
  )
}
