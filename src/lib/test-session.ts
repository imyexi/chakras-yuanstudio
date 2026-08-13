export type Answers = Record<number, number>
export type ChakraScores = Record<string, number>
export type StoredResult = {
  scores: ChakraScores
  answers: Answers
  completedAt: string
}
export type RestoredSession =
  | { kind: 'progress'; answers: Answers; currentQuestion: number }
  | { kind: 'completed'; answers: Answers; currentQuestion: 55 }
  | { kind: 'result'; result: StoredResult }
  | { kind: 'empty' }

export const SESSION_STORAGE_KEYS = {
  answers: 'chakra-test-answers',
  currentQuestion: 'chakra-test-current-question',
  result: 'chakra-test-result',
} as const

const CHAKRA_KEYS = ['海底轮', '太阳轮', '脐轮', '心轮', '喉轮', '眉心轮', '顶轮'] as const

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function isAnswer(question: unknown, option: unknown): option is number {
  return typeof question === 'number'
    && Number.isInteger(question)
    && question >= 1
    && question <= 56
    && typeof option === 'number'
    && Number.isInteger(option)
    && option >= 0
    && option <= 4
}

export function sanitizeAnswers(value: unknown): Answers {
  if (!isPlainObject(value)) return {}

  const answers: Answers = {}
  for (const [questionKey, option] of Object.entries(value)) {
    const question = Number(questionKey)
    if (String(question) === questionKey && isAnswer(question, option)) answers[question] = option
  }
  return answers
}

export function findFirstMissingQuestion(answers: Answers): number | null {
  for (let question = 1; question <= 56; question += 1) {
    if (!isAnswer(question, answers[question])) return question
  }
  return null
}

export function sanitizeCurrentQuestion(value: unknown, answers: Answers): number {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 55) return value
  const missing = findFirstMissingQuestion(answers)
  return missing === null ? 55 : missing - 1
}

export function sanitizeStoredResult(value: unknown): StoredResult | null {
  if (!isPlainObject(value) || !isPlainObject(value.scores) || typeof value.completedAt !== 'string' || Number.isNaN(Date.parse(value.completedAt))) {
    return null
  }

  const scores: ChakraScores = {}
  for (const key of CHAKRA_KEYS) {
    const score = value.scores[key]
    if (typeof score !== 'number' || !Number.isFinite(score) || score < -100 || score > 100) return null
    scores[key] = score
  }

  return {
    scores,
    answers: sanitizeAnswers(value.answers),
    completedAt: value.completedAt,
  }
}

function getStoredValue(storage: Pick<Storage, 'getItem' | 'removeItem'>, key: string): string | null {
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

function parseStoredJson(storage: Pick<Storage, 'getItem' | 'removeItem'>, key: string): unknown {
  const raw = getStoredValue(storage, key)
  if (raw === null) return null
  try {
    return JSON.parse(raw)
  } catch {
    try {
      storage.removeItem(key)
    } catch {
      // 存储不可用时保持无异常回退。
    }
    return null
  }
}

export function restoreSession(storage: Pick<Storage, 'getItem' | 'removeItem'>): RestoredSession {
  const answers = sanitizeAnswers(parseStoredJson(storage, SESSION_STORAGE_KEYS.answers))
  const savedQuestion = getStoredValue(storage, SESSION_STORAGE_KEYS.currentQuestion)
  const currentQuestion = sanitizeCurrentQuestion(savedQuestion === null ? null : Number(savedQuestion), answers)
  const result = sanitizeStoredResult(parseStoredJson(storage, SESSION_STORAGE_KEYS.result))
  const missing = findFirstMissingQuestion(answers)

  if (missing !== 1 && missing !== null) return { kind: 'progress', answers, currentQuestion }
  if (missing === null) {
    if (result) return { kind: 'result', result }
    return { kind: 'completed', answers, currentQuestion: 55 }
  }
  if (result) return { kind: 'result', result }
  return { kind: 'empty' }
}

function trySetItem(storage: Pick<Storage, 'setItem'>, key: string, value: string): boolean {
  try {
    storage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

export function saveProgress(storage: Pick<Storage, 'setItem'>, answers: Answers, currentQuestion: number): boolean {
  const savedAnswers = trySetItem(storage, SESSION_STORAGE_KEYS.answers, JSON.stringify(answers))
  const savedQuestion = trySetItem(storage, SESSION_STORAGE_KEYS.currentQuestion, String(currentQuestion))
  return savedAnswers && savedQuestion
}

export function saveResult(storage: Pick<Storage, 'setItem'>, result: StoredResult): boolean {
  return trySetItem(storage, SESSION_STORAGE_KEYS.result, JSON.stringify(result))
}

function tryRemoveItem(storage: Pick<Storage, 'removeItem'>, key: string): void {
  try {
    storage.removeItem(key)
  } catch {
    // 每个键独立清理，失败不阻止下一键。
  }
}

export function clearProgress(storage: Pick<Storage, 'removeItem'>): void {
  tryRemoveItem(storage, SESSION_STORAGE_KEYS.answers)
  tryRemoveItem(storage, SESSION_STORAGE_KEYS.currentQuestion)
}

export function clearResult(storage: Pick<Storage, 'removeItem'>): void {
  tryRemoveItem(storage, SESSION_STORAGE_KEYS.result)
}
