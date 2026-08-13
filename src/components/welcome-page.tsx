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
      <span className="chakra-orbit__ring chakra-orbit__ring--outer" />
      <span className="chakra-orbit__ring chakra-orbit__ring--middle" />
      <span className="chakra-orbit__ring chakra-orbit__ring--inner" />
      <span className="chakra-orbit__node chakra-orbit__node--root" />
      <span className="chakra-orbit__node chakra-orbit__node--sacral" />
      <span className="chakra-orbit__node chakra-orbit__node--solar" />
      <span className="chakra-orbit__node chakra-orbit__node--heart" />
      <span className="chakra-orbit__node chakra-orbit__node--throat" />
      <span className="chakra-orbit__node chakra-orbit__node--third-eye" />
      <span className="chakra-orbit__node chakra-orbit__node--crown" />
      <span className="chakra-orbit__center" />
    </div>
  )
}

export function WelcomePage({ progressInfo, onStart, onContinue, onRestart }: WelcomePageProps) {
  const isNewUser = progressInfo.answered === 0 && !progressInfo.completed
  const isCompleted = progressInfo.answered === 56 && progressInfo.completed
  const onPrimaryAction = isNewUser ? onStart : onContinue
  const confirmRestart = () => {
    if (window.confirm('这会清除当前设备上的答题进度。是否重新开始？')) onRestart()
  }

  return (
    <TestShell>
      <section className="welcome-page" aria-labelledby="welcome-page-title">
        <div className="welcome-page__content">
          <div className="welcome-page__copy">
            <p className="welcome-page__eyebrow welcome-page__reveal">Chakra Archetype</p>
            <h1 id="welcome-page-title" className="welcome-page__title welcome-page__reveal">
              看见你的能量秩序
            </h1>
            <p className="welcome-page__intro welcome-page__reveal">
              沿着七种能量线索，读出你此刻的主导力量、辅助风格与成长课题。
            </p>
            <div className="welcome-page__meta welcome-page__reveal" aria-label="测试信息">
              <span>56 道题</span>
              <span>约 5–10 分钟</span>
              <span>可中途续答</span>
            </div>
            {isNewUser && (
              <div className="welcome-page__controls">
                <PrimaryAction onClick={onPrimaryAction}>开始测试</PrimaryAction>
              </div>
            )}
            <details className="welcome-page__details">
              <summary>测试如何进行</summary>
              <ul>
                <li>共 56 道题，请按真实感受作答。</li>
                <li>预计用时 5–10 分钟。</li>
                <li>答题进度仅保存在当前设备，可中途续答。</li>
                <li>结果仅用于自我探索，不构成医学或心理诊断。</li>
              </ul>
            </details>
          </div>
          <div className="welcome-page__visual welcome-page__reveal">
            <ChakraOrbit />
          </div>
        </div>
        {!isNewUser && (
          <section
            className="welcome-page__progress welcome-page__reveal"
            aria-label="上次测试进度"
            aria-live="polite"
          >
            <div>
              <p>{isCompleted ? '答案已完成，待查看结果' : '继续上一次探索'}</p>
              <p>已完成 {progressInfo.answered} / 56 题 · 进度仅保存在当前设备</p>
            </div>
            <div className="welcome-page__controls">
              <PrimaryAction onClick={onPrimaryAction}>继续测试</PrimaryAction>
              <button type="button" className="welcome-page__restart" onClick={confirmRestart}>
                重新开始
              </button>
            </div>
          </section>
        )}
      </section>
    </TestShell>
  )
}
