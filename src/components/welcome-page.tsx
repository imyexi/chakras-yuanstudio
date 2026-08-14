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
    <svg
      className="chakra-orbit"
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
    >
      <circle className="chakra-orbit__ring chakra-orbit__ring--outer" cx="50" cy="50" r="47" />
      <circle className="chakra-orbit__ring chakra-orbit__ring--middle" cx="50" cy="50" r="28" />
      <circle className="chakra-orbit__ring chakra-orbit__ring--inner" cx="50" cy="50" r="11" />
      <circle className="chakra-orbit__node chakra-orbit__node--root" cx="50" cy="97" r="1.75" />
      <circle className="chakra-orbit__node chakra-orbit__node--sacral" cx="16.766" cy="83.234" r="1.75" />
      <circle className="chakra-orbit__node chakra-orbit__node--solar" cx="3" cy="50" r="1.75" />
      <circle className="chakra-orbit__node chakra-orbit__node--heart" cx="16.766" cy="16.766" r="1.75" />
      <circle className="chakra-orbit__node chakra-orbit__node--throat" cx="50" cy="3" r="1.75" />
      <circle className="chakra-orbit__node chakra-orbit__node--third-eye" cx="83.234" cy="16.766" r="1.75" />
      <circle className="chakra-orbit__node chakra-orbit__node--crown" cx="97" cy="50" r="1.75" />
      <rect
        className="chakra-orbit__center"
        x="46"
        y="46"
        width="8"
        height="8"
        transform="rotate(45 50 50)"
      />
    </svg>
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
