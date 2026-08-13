'use client'

import type { ProgressInfo } from '@/hooks/use-test-session'
import { TestShell } from './test-shell'

type WelcomePageProps = {
  progressInfo: ProgressInfo
  onStart: () => void
  onContinue: () => void
  onRestart: () => void
}

function PrimaryAction({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" className="welcome-page__primary-action" data-variant="primary" onClick={onClick}>
      {children}
    </button>
  )
}

function ChakraOrbit() {
  return (
    <div className="chakra-orbit" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  )
}

export function WelcomePage({ progressInfo, onStart, onContinue, onRestart }: WelcomePageProps) {
  const isNewUser = progressInfo.answered === 0 && !progressInfo.completed
  const isCompleted = progressInfo.answered === 56 && progressInfo.completed
  const primaryLabel = isNewUser ? '开始测试' : isCompleted ? '查看结果' : '继续测试'
  const onPrimaryAction = isNewUser ? onStart : onContinue

  return (
    <TestShell>
      <section className="welcome-page" aria-labelledby="welcome-page-title">
        <div className="welcome-page__content">
          <div className="welcome-page__copy">
            <p className="welcome-page__eyebrow welcome-page__reveal">Chakra Archetype</p>
            <h1 id="welcome-page-title" className="welcome-page__title welcome-page__reveal">
              看见你的能量秩序
            </h1>
            {isNewUser ? (
              <p className="welcome-page__intro welcome-page__reveal">
                56 道题 · 约 8 分钟 · 结果仅作自我探索参考
              </p>
            ) : (
              <div className="welcome-page__progress welcome-page__reveal" aria-live="polite">
                <p>{isCompleted ? '答案已完成，待查看结果' : '发现未完成的测试'}</p>
                <p>已完成 {progressInfo.answered}/56 题（{progressInfo.percentage}%）</p>
              </div>
            )}
            <div className="welcome-page__controls">
              <PrimaryAction onClick={onPrimaryAction}>{primaryLabel}</PrimaryAction>
              {!isNewUser && (
                <button type="button" className="welcome-page__restart" onClick={onRestart}>
                  重新开始
                </button>
              )}
            </div>
            <details className="welcome-page__details">
              <summary>测试如何进行</summary>
              <ul>
                <li>请按真实感受作答。</li>
                <li>可在同一设备上继续答题。</li>
                <li>结果描述当前能量，而非永久人格。</li>
              </ul>
            </details>
          </div>
          <div className="welcome-page__visual welcome-page__reveal">
            <ChakraOrbit />
          </div>
        </div>
      </section>
    </TestShell>
  )
}
