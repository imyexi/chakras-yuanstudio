'use client'

import * as React from 'react'
import { QuestionPage } from '@/components/question-page'
import { ResultPage } from '@/components/result-page'
import { TestShell } from '@/components/test-shell'
import { WelcomePage } from '@/components/welcome-page'
import { useTestSession } from '@/hooks/use-test-session'

function BootingState() {
  return (
    <section aria-labelledby="booting-title" role="status">
      <h1 id="booting-title">脉轮能量测试</h1>
      <p>正在恢复测试</p>
    </section>
  )
}

function ResultError({ onRestart }: { onRestart: () => void }) {
  return (
    <section aria-labelledby="result-error-title" role="alert">
      <h1 id="result-error-title">结果数据暂时无法读取</h1>
      <p>请返回首页后重新测试。</p>
      <button type="button" onClick={onRestart}>返回首页</button>
    </section>
  )
}

export default function Home() {
  const session = useTestSession()

  React.useLayoutEffect(() => {
    if (window.scrollY > 0) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }
  }, [session.pageState])

  if (session.pageState === 'booting') {
    return (
      <TestShell>
        <BootingState />
      </TestShell>
    )
  }

  if (session.pageState === 'welcome') {
    return (
      <WelcomePage
        progressInfo={session.progressInfo}
        onStart={session.start}
        onContinue={session.continueTest}
        onRestart={session.restart}
      />
    )
  }

  if (session.pageState === 'test') {
    return (
      <TestShell
        actions={(
          <button className="test-shell__exit hidden md:inline-flex" type="button" onClick={session.saveAndExit}>
            {session.storageWarning ? '退出测试' : '暂存并退出'}
          </button>
        )}
      >
        <QuestionPage
          currentQuestion={session.currentQuestion}
          answers={session.answers}
          backupStatus={session.backupStatus}
          storageWarning={session.storageWarning}
          onSelectAnswer={session.selectAnswer}
          onGoToQuestion={session.goToQuestion}
          onSaveAndExit={session.saveAndExit}
          onSubmit={() => { void session.submit() }}
        />
      </TestShell>
    )
  }

  return (
    <TestShell middleLabel="脉轮人物原型报告">
      {session.result && session.version ? (
        <ResultPage
          result={session.result}
          version={session.version}
          backupStatus={session.backupStatus}
          storageWarning={session.storageWarning}
          onRestart={session.restart}
        />
      ) : (
        <ResultError onRestart={session.restart} />
      )}
    </TestShell>
  )
}
