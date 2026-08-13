'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { calculateAllChakraScores } from '@/lib/chakra-data'
import { getDeviceId } from '@/lib/device'
import {
  clearProgress,
  clearResult,
  findFirstMissingQuestion,
  restoreSession,
  saveProgress,
  saveResult,
  SESSION_STORAGE_KEYS,
  type Answers,
  type StoredResult,
} from '@/lib/test-session'

export type PageState = 'booting' | 'welcome' | 'test' | 'result'
export type BackupStatus = 'idle' | 'saving' | 'saved' | 'failed'
export type ProgressInfo = {
  answered: number
  total: 56
  percentage: number
  completed: boolean
}

const PROGRESS_WARNING = '当前设备无法保存答题进度，关闭页面后可能丢失'
const RESULT_WARNING = '当前结果未能保存，关闭页面后可能丢失'

function getStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function sessionKeysAreCleared(storage: Storage): boolean {
  try {
    return Object.values(SESSION_STORAGE_KEYS).every((key) => storage.getItem(key) === null)
  } catch {
    return false
  }
}

export function useTestSession() {
  const [pageState, setPageState] = useState<PageState>('booting')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [result, setResult] = useState<StoredResult | null>(null)
  const [backupStatus, setBackupStatus] = useState<BackupStatus>('idle')
  const [storageWarning, setStorageWarning] = useState<string | null>(null)

  const pageStateRef = useRef<PageState>('booting')
  const currentQuestionRef = useRef(0)
  const answersRef = useRef<Answers>({})
  const sessionRef = useRef(0)
  const submittingRef = useRef(false)

  const updatePageState = (next: PageState) => {
    pageStateRef.current = next
    setPageState(next)
  }

  const updateCurrentQuestion = (next: number) => {
    currentQuestionRef.current = next
    setCurrentQuestion(next)
  }

  const updateAnswers = (next: Answers) => {
    answersRef.current = next
    setAnswers(next)
  }

  const persistProgress = (nextAnswers: Answers, nextQuestion: number) => {
    const storage = getStorage()
    if (!storage || !saveProgress(storage, nextAnswers, nextQuestion)) {
      setStorageWarning(PROGRESS_WARNING)
      return false
    }
    return true
  }

  useEffect(() => {
    const storage = getStorage()
    const restored = storage ? restoreSession(storage) : { kind: 'empty' as const }

    if (restored.kind === 'progress' || restored.kind === 'completed') {
      updateAnswers(restored.answers)
      updateCurrentQuestion(restored.currentQuestion)
      updatePageState('welcome')
    } else if (restored.kind === 'result') {
      updateAnswers(restored.result.answers)
      updateCurrentQuestion(55)
      setResult(restored.result)
      updatePageState('result')
    } else {
      updatePageState('welcome')
    }

    const saveLatestProgress = () => {
      if (pageStateRef.current === 'test') {
        persistProgress(answersRef.current, currentQuestionRef.current)
      }
    }
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') saveLatestProgress()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', saveLatestProgress)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', saveLatestProgress)
    }
  }, [])

  const resetSession = (nextPageState: 'welcome' | 'test') => {
    sessionRef.current += 1
    submittingRef.current = false
    const storage = getStorage()
    if (storage) {
      clearProgress(storage)
      clearResult(storage)
    }
    const storageCleared = storage !== null && sessionKeysAreCleared(storage)
    updateAnswers({})
    updateCurrentQuestion(0)
    setResult(null)
    setBackupStatus('idle')
    setStorageWarning(storageCleared ? null : PROGRESS_WARNING)
    updatePageState(nextPageState)
  }

  const start = () => resetSession('test')

  const restart = () => resetSession('welcome')

  const continueTest = () => {
    if (pageStateRef.current === 'welcome' && Object.keys(answersRef.current).length > 0) {
      updatePageState('test')
    }
  }

  const saveAndExit = () => {
    persistProgress(answersRef.current, currentQuestionRef.current)
    updatePageState('welcome')
  }

  const selectAnswer = (questionId: number, answerIndex: number) => {
    const nextAnswers = { ...answersRef.current, [questionId]: answerIndex }
    updateAnswers(nextAnswers)
    persistProgress(nextAnswers, currentQuestionRef.current)
  }

  const goToQuestion = (index: number) => {
    const nextQuestion = Math.max(0, Math.min(55, index))
    updateCurrentQuestion(nextQuestion)
    persistProgress(answersRef.current, nextQuestion)
  }

  const submit = async () => {
    if (submittingRef.current) return
    submittingRef.current = true

    const missingQuestion = findFirstMissingQuestion(answersRef.current)
    if (missingQuestion !== null) {
      updateCurrentQuestion(missingQuestion - 1)
      updatePageState('test')
      submittingRef.current = false
      return
    }

    const submissionSession = sessionRef.current
    const snapshotAnswers = Object.freeze({ ...answersRef.current })
    const snapshotScores = Object.freeze(calculateAllChakraScores(snapshotAnswers))
    const snapshot = Object.freeze({
      scores: snapshotScores,
      answers: snapshotAnswers,
      completedAt: new Date().toISOString(),
    })

    const storage = getStorage()
    if (storage && saveResult(storage, snapshot)) {
      clearProgress(storage)
      setStorageWarning(null)
    } else {
      setStorageWarning(RESULT_WARNING)
    }

    setResult(snapshot)
    setBackupStatus('saving')
    updatePageState('result')

    try {
      const response = await fetch('/chakras/api/test-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: getDeviceId(),
          scores: snapshot.scores,
          answers: snapshot.answers,
        }),
      })
      const data = response.ok ? await response.json() : null
      if (sessionRef.current === submissionSession) {
        setBackupStatus(response.ok && data?.success === true ? 'saved' : 'failed')
      }
    } catch {
      if (sessionRef.current === submissionSession) setBackupStatus('failed')
    } finally {
      if (sessionRef.current === submissionSession) submittingRef.current = false
    }
  }

  const progressInfo = useMemo<ProgressInfo>(() => {
    const answered = Object.keys(answers).length
    return {
      answered,
      total: 56,
      percentage: Math.round((answered / 56) * 100),
      completed: answered === 56 && findFirstMissingQuestion(answers) === null,
    }
  }, [answers])

  return {
    pageState,
    currentQuestion,
    answers,
    result,
    backupStatus,
    storageWarning,
    progressInfo,
    start,
    continueTest,
    saveAndExit,
    selectAnswer,
    goToQuestion,
    submit,
    restart,
  }
}
