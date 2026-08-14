# 脉轮测试 V2 实现计划

> **供智能体执行：** 必须使用 `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans`，按任务逐项实现；使用复选框跟踪每一步。

**目标：** 在保持 `/chakras` V1 行为不变的前提下，让 Nginx 别名入口 `/chakra` 使用独立浏览器会话，并将 V2 海底轮分数调整为 `min(V1 + 20, 100)`。

**架构：** 保留当前单一 Next.js 构建和 `/chakras` basePath。客户端挂载后先根据 `window.location.pathname` 解析 `TestVersion`，再恢复对应版本的本地会话；计分、存储和分享均显式消费同一版本。Nginx 的 `/chakra` 精确内部映射属于部署步骤，不在仓库中猜测线上上游或端口。

**技术栈：** TypeScript、React 19、Next.js 16、Vitest、Testing Library、jsdom、PowerShell、Next.js standalone。

**规格：** `docs/superpowers/specs/2026-08-14-chakra-v2-scoring-design.md`

## 全局约束

- 所有思考、输出、代码注释和文档使用中文；代码标识符沿用仓库现有英文命名。
- V1 地址固定为 `/chakras`，V2 公开地址固定为 `/chakra`。
- V2 公式固定为 `min(V1 海底轮整数分数 + 20, 100)`；其余六轮不变。
- V1 现有三个 localStorage 键原文不变；V2 使用 `chakra-test-v2-*` 三个新键。
- 主题键 `chakra-test-theme-v1` 继续共用。
- API 继续使用 `/chakras/api/test-results`，请求体严格只有 `deviceId`、`scores`、`answers`。
- 不修改 Prisma schema、题库、页面视觉结构与样式、全局样式、静态资源或 Next.js basePath。
- 不复制欢迎页、答题页或结果页；未知路径默认 V1。
- 所有生产代码必须在对应失败测试之后编写，并实际观察 RED、GREEN 两个阶段。
- 只暂存当前任务列出的文件，不使用 `git add .`，不处理现有未跟踪图片、设计稿或临时文件。

## 文件职责

- 新建 `src/lib/test-version.ts`：定义版本类型、路径解析和分享地址。
- 新建 `src/lib/test-version.test.ts`：锁定版本路径和分享地址契约。
- 修改 `src/lib/chakra-data.ts`：在现有整数分数之后应用 V2 海底轮调整。
- 修改 `src/lib/chakra-data.test.ts`：覆盖默认 V1、V2 加分、四舍五入顺序和上下界。
- 修改 `src/lib/test-session.ts`：保留 V1 键并让读、写、清除操作按版本选择键。
- 修改 `src/lib/test-session.test.ts`：证明两个版本互不恢复、覆盖或清理。
- 修改 `src/hooks/use-test-session.ts`：启动时解析版本，并把同一版本贯穿恢复、提交和兜底保存。
- 修改 `src/hooks/use-test-session.test.tsx`：覆盖 SSR 未解析状态与 `/chakra` 完整提交隔离。
- 修改 `src/app/page.tsx`：把已解析版本显式传给结果页。
- 修改 `src/app/page.test.tsx`：锁定 Home 到 ResultPage 的 V2 版本接线。
- 修改 `src/components/result-page.tsx`：按显式版本生成分享链接。
- 修改 `src/components/result-page.test.tsx`：保留 V1 分享全文并新增 V2 分享断言。

---

### 任务 1：建立版本契约

**文件：**

- 新建：`src/lib/test-version.ts`
- 新建：`src/lib/test-version.test.ts`

**接口：**

- 产出：`TestVersion = 'v1' | 'v2'`
- 产出：`resolveTestVersion(pathname: string): TestVersion`
- 产出：`getTestShareUrl(version: TestVersion): string`

- [ ] **步骤 1：写版本解析和分享地址的失败测试**

新建 `src/lib/test-version.test.ts`：

```ts
import { describe, expect, it } from 'vitest'

import { getTestShareUrl, resolveTestVersion } from '@/lib/test-version'

describe('测试版本契约', () => {
  it.each(['/chakra', '/chakra/'])('%s 解析为 V2', (pathname) => {
    expect(resolveTestVersion(pathname)).toBe('v2')
  })

  it.each(['/chakras', '/chakras/', '/chakrafoo', '/', ''])('%s 默认解析为 V1', (pathname) => {
    expect(resolveTestVersion(pathname)).toBe('v1')
  })

  it('为两个版本返回各自公开分享地址', () => {
    expect(getTestShareUrl('v1')).toBe('https://yyry.studio/chakras')
    expect(getTestShareUrl('v2')).toBe('https://yyry.studio/chakra')
  })
})
```

- [ ] **步骤 2：运行测试并确认 RED**

运行：

```powershell
npm test -- src/lib/test-version.test.ts
```

预期：失败，错误明确指向 `@/lib/test-version` 模块不存在。

- [ ] **步骤 3：写最小版本实现**

新建 `src/lib/test-version.ts`：

```ts
export type TestVersion = 'v1' | 'v2'

const TEST_SHARE_URLS: Record<TestVersion, string> = {
  v1: 'https://yyry.studio/chakras',
  v2: 'https://yyry.studio/chakra',
}

export function resolveTestVersion(pathname: string): TestVersion {
  return pathname === '/chakra' || pathname === '/chakra/' ? 'v2' : 'v1'
}

export function getTestShareUrl(version: TestVersion): string {
  return TEST_SHARE_URLS[version]
}
```

- [ ] **步骤 4：运行测试并确认 GREEN**

运行：

```powershell
npm test -- src/lib/test-version.test.ts
```

预期：测试文件全部通过，无警告或错误。

- [ ] **步骤 5：提交版本契约**

```powershell
git add -- src/lib/test-version.ts src/lib/test-version.test.ts
git commit -m "feat: add chakra test versions"
```

---

### 任务 2：实现 V2 海底轮计分

**文件：**

- 修改：`src/lib/chakra-data.test.ts:1-32`
- 修改：`src/lib/chakra-data.ts:251-260`

**接口：**

- 消费：任务 1 的 `TestVersion`
- 产出：`calculateAllChakraScores(answers, version?: TestVersion): Record<string, number>`
- 兼容：省略 `version` 必须等价于显式传入 `'v1'`

- [ ] **步骤 1：写 V2 加分和边界失败测试**

在 `src/lib/chakra-data.test.ts` 顶层增加：

```ts
const 中间项答案 = Object.fromEntries(
  Array.from({ length: 56 }, (_, index) => [index + 1, 2]),
)
```

把现有“56 题全选中间项”用例中的局部 `answers` 改为 `中间项答案`，然后追加：

```ts
it('省略版本等价于 V1，V2 只给海底轮增加 20 分', () => {
  const 反向题得分答案 = { ...中间项答案, 2: 0, 3: 0 }
  const 默认分数 = calculateAllChakraScores(反向题得分答案)
  const v1分数 = calculateAllChakraScores(反向题得分答案, 'v1')
  const v2分数 = calculateAllChakraScores(反向题得分答案, 'v2')

  expect(默认分数).toEqual(v1分数)
  expect(v1分数.海底轮).toBe(25)
  expect(v2分数).toEqual({ ...v1分数, 海底轮: 45 })
  expect(calculateAllChakraScores(中间项答案, 'v2')).toEqual({
    ...calculateAllChakraScores(中间项答案, 'v1'),
    海底轮: 20,
  })
})

it('V2 在现有四舍五入之后加分并封顶为 100', () => {
  const 边界答案 = { 1: 4, 2: 0, 3: 1, 4: 4, 5: 4, 6: 2, 7: 4, 8: 4 }

  expect(calculateAllChakraScores(边界答案).海底轮).toBe(81)
  expect(calculateAllChakraScores(边界答案, 'v2').海底轮).toBe(100)
})

it.each([
  ['正向满分', { 1: 4, 2: 0, 3: 0, 4: 4, 5: 4, 6: 0, 7: 4, 8: 4 }, 100, 100],
  ['反向满分', { 1: 0, 2: 4, 3: 4, 4: 0, 5: 0, 6: 4, 7: 0, 8: 0 }, -100, -80],
] as const)('%s保持 V1 边界并应用 V2 规则', (_name, answers, v1Root, v2Root) => {
  expect(calculateAllChakraScores(answers).海底轮).toBe(v1Root)
  expect(calculateAllChakraScores(answers, 'v2').海底轮).toBe(v2Root)
})
```

- [ ] **步骤 2：运行计分测试并确认 RED**

运行：

```powershell
npm test -- src/lib/chakra-data.test.ts
```

预期：V2 断言失败；当前函数忽略第二个参数，中间项仍为 `0`、反向题仍为 `25`、负向满分仍为 `-100`。

- [ ] **步骤 3：写最小计分实现**

在 `src/lib/chakra-data.ts` 顶部增加类型导入：

```ts
import type { TestVersion } from '@/lib/test-version'
```

只替换 `calculateAllChakraScores`：

```ts
export function calculateAllChakraScores(
  answers: Record<number, number>,
  version: TestVersion = 'v1',
): Record<string, number> {
  const scores: Record<string, number> = {};
  chakras.forEach(chakra => {
    const rawScore = calculateChakraScore(answers, chakra.startQuestion, chakra.endQuestion);
    const percentage = Math.round(rawScore);
    const score = Math.max(-100, Math.min(100, percentage));
    scores[chakra.name] = version === 'v2' && chakra.name === '海底轮'
      ? Math.min(score + 20, 100)
      : score;
  });
  return scores;
}
```

不要修改第 1 至 8 题的原始 `scores` 数组。

- [ ] **步骤 4：运行计分和原型回归并确认 GREEN**

运行：

```powershell
npm test -- src/lib/chakra-data.test.ts src/lib/chakra-archetypes.test.ts
```

预期：全部通过；旧调用仍走 V1，原型回归不变。

- [ ] **步骤 5：提交计分规则**

```powershell
git add -- src/lib/chakra-data.ts src/lib/chakra-data.test.ts
git commit -m "feat: add v2 root chakra scoring"
```

---

### 任务 3：隔离 V1 与 V2 浏览器会话

**文件：**

- 修改：`src/lib/test-session.test.ts:1-239`
- 修改：`src/lib/test-session.ts:1-163`

**接口：**

- 消费：任务 1 的 `TestVersion`
- 产出：`SessionStorageKeys`
- 产出：`V2_SESSION_STORAGE_KEYS`
- 产出：`getSessionStorageKeys(version?: TestVersion): SessionStorageKeys`
- 扩展：`restoreSession`、`saveProgress`、`saveResult`、`clearProgress`、`clearResult` 的最后一个参数为可选 `version`，默认 V1

- [ ] **步骤 1：写存储键和隔离失败测试**

在 `src/lib/test-session.test.ts` 的导入中增加 `V2_SESSION_STORAGE_KEYS` 和 `getSessionStorageKeys`，然后在现有 describe 末尾追加：

```ts
it('V1 与 V2 使用完全不同的三组会话键', () => {
  expect(getSessionStorageKeys()).toEqual(SESSION_STORAGE_KEYS)
  expect(getSessionStorageKeys('v1')).toEqual(SESSION_STORAGE_KEYS)
  expect(getSessionStorageKeys('v2')).toEqual(V2_SESSION_STORAGE_KEYS)

  for (const v2Key of Object.values(V2_SESSION_STORAGE_KEYS)) {
    expect(Object.values(SESSION_STORAGE_KEYS)).not.toContain(v2Key)
  }
})

it('V2 只恢复自己的进度，只有 V1 数据时保持空会话', () => {
  const 只有V1 = 创建内存存储({
    [SESSION_STORAGE_KEYS.answers]: JSON.stringify({ 1: 0 }),
    [SESSION_STORAGE_KEYS.currentQuestion]: '0',
    [SESSION_STORAGE_KEYS.result]: JSON.stringify({
      scores: 完整分数,
      answers: 完整答案,
      completedAt: '2026-08-13T10:00:00.000Z',
    }),
  })
  expect(restoreSession(只有V1, 'v2')).toEqual({ kind: 'empty' })
  expect(只有V1.数据).toHaveProperty(SESSION_STORAGE_KEYS.answers)
  expect(只有V1.数据).toHaveProperty(SESSION_STORAGE_KEYS.result)

  const 两个版本 = 创建内存存储({
    [SESSION_STORAGE_KEYS.answers]: JSON.stringify({ 1: 0 }),
    [SESSION_STORAGE_KEYS.currentQuestion]: '0',
    [V2_SESSION_STORAGE_KEYS.answers]: JSON.stringify({ 1: 4, 2: 3 }),
    [V2_SESSION_STORAGE_KEYS.currentQuestion]: '1',
  })
  expect(restoreSession(两个版本)).toEqual({
    kind: 'progress',
    answers: { 1: 0 },
    currentQuestion: 0,
  })
  expect(restoreSession(两个版本, 'v2')).toEqual({
    kind: 'progress',
    answers: { 1: 4, 2: 3 },
    currentQuestion: 1,
  })
})

it('V2 保存和清除只操作 V2 键，不覆盖或删除 V1', () => {
  const v1结果 = {
    scores: 完整分数,
    answers: 完整答案,
    completedAt: '2026-08-13T10:00:00.000Z',
  }
  const 存储 = 创建内存存储({
    [SESSION_STORAGE_KEYS.answers]: JSON.stringify({ 1: 0 }),
    [SESSION_STORAGE_KEYS.currentQuestion]: '0',
    [SESSION_STORAGE_KEYS.result]: JSON.stringify(v1结果),
  })

  expect(saveProgress(存储, { 1: 4 }, 8, 'v2')).toBe(true)
  expect(saveResult(存储, {
    scores: { ...完整分数, 海底轮: -80 },
    answers: { 1: 4 },
    completedAt: '2026-08-14T10:00:00.000Z',
  }, 'v2')).toBe(true)

  expect(存储.数据[SESSION_STORAGE_KEYS.answers]).toBe('{"1":0}')
  expect(存储.数据[SESSION_STORAGE_KEYS.currentQuestion]).toBe('0')
  expect(存储.数据[SESSION_STORAGE_KEYS.result]).toBe(JSON.stringify(v1结果))
  expect(存储.数据[V2_SESSION_STORAGE_KEYS.answers]).toBe('{"1":4}')
  expect(存储.数据[V2_SESSION_STORAGE_KEYS.currentQuestion]).toBe('8')
  expect(存储.数据).toHaveProperty(V2_SESSION_STORAGE_KEYS.result)

  clearProgress(存储, 'v2')
  clearResult(存储, 'v2')

  expect(存储.数据).toHaveProperty(SESSION_STORAGE_KEYS.answers)
  expect(存储.数据).toHaveProperty(SESSION_STORAGE_KEYS.currentQuestion)
  expect(存储.数据).toHaveProperty(SESSION_STORAGE_KEYS.result)
  expect(存储.数据).not.toHaveProperty(V2_SESSION_STORAGE_KEYS.answers)
  expect(存储.数据).not.toHaveProperty(V2_SESSION_STORAGE_KEYS.currentQuestion)
  expect(存储.数据).not.toHaveProperty(V2_SESSION_STORAGE_KEYS.result)
})
```

- [ ] **步骤 2：运行会话纯函数测试并确认 RED**

运行：

```powershell
npm test -- src/lib/test-session.test.ts
```

预期：失败，首先报告新增导出不存在；若只补导出而未贯穿函数，V2 会错误恢复或清除 V1 键。

- [ ] **步骤 3：定义两组键与版本选择函数**

在 `src/lib/test-session.ts` 顶部增加：

```ts
import type { TestVersion } from '@/lib/test-version'

export type SessionStorageKeys = {
  readonly answers: string
  readonly currentQuestion: string
  readonly result: string
}

export const SESSION_STORAGE_KEYS: SessionStorageKeys = {
  answers: 'chakra-test-answers',
  currentQuestion: 'chakra-test-current-question',
  result: 'chakra-test-result',
}

export const V2_SESSION_STORAGE_KEYS: SessionStorageKeys = {
  answers: 'chakra-test-v2-answers',
  currentQuestion: 'chakra-test-v2-current-question',
  result: 'chakra-test-v2-result',
}

export function getSessionStorageKeys(version: TestVersion = 'v1'): SessionStorageKeys {
  return version === 'v2' ? V2_SESSION_STORAGE_KEYS : SESSION_STORAGE_KEYS
}
```

删除原来重复的 `SESSION_STORAGE_KEYS` 声明，其三个 V1 字符串不得改变。

- [ ] **步骤 4：让恢复、保存和清理显式使用所选版本**

把五个公开函数调整为以下结构；验证和 JSON 解析辅助函数保持原样：

```ts
export function restoreSession(
  storage: Pick<Storage, 'getItem' | 'removeItem'>,
  version: TestVersion = 'v1',
): RestoredSession {
  const keys = getSessionStorageKeys(version)
  const answers = sanitizeAnswers(parseStoredJson(storage, keys.answers))
  const savedQuestion = getStoredValue(storage, keys.currentQuestion)
  const savedQuestionValue = savedQuestion !== null && /^(0|[1-9]\d*)$/.test(savedQuestion)
    ? Number(savedQuestion)
    : null
  const currentQuestion = sanitizeCurrentQuestion(savedQuestionValue, answers)
  const rawResult = getStoredValue(storage, keys.result)
  const storedResult = rawResult === null ? null : parseStoredJson(storage, keys.result)
  const result = sanitizeStoredResult(storedResult)
  if (rawResult !== null && result === null) {
    tryRemoveItem(storage, keys.result)
  }
  const missing = findFirstMissingQuestion(answers)

  if (Object.keys(answers).length > 0 && missing !== null) return { kind: 'progress', answers, currentQuestion }
  if (missing === null) {
    if (result) return { kind: 'result', result }
    return { kind: 'completed', answers, currentQuestion: 55 }
  }
  if (result) return { kind: 'result', result }
  return { kind: 'empty' }
}

export function saveProgress(
  storage: Pick<Storage, 'setItem'>,
  answers: Answers,
  currentQuestion: number,
  version: TestVersion = 'v1',
): boolean {
  const keys = getSessionStorageKeys(version)
  const savedAnswers = trySetItem(storage, keys.answers, JSON.stringify(answers))
  const savedQuestion = trySetItem(storage, keys.currentQuestion, String(currentQuestion))
  return savedAnswers && savedQuestion
}

export function saveResult(
  storage: Pick<Storage, 'setItem'>,
  result: StoredResult,
  version: TestVersion = 'v1',
): boolean {
  return trySetItem(storage, getSessionStorageKeys(version).result, JSON.stringify(result))
}

export function clearProgress(
  storage: Pick<Storage, 'removeItem'>,
  version: TestVersion = 'v1',
): void {
  const keys = getSessionStorageKeys(version)
  tryRemoveItem(storage, keys.answers)
  tryRemoveItem(storage, keys.currentQuestion)
}

export function clearResult(
  storage: Pick<Storage, 'removeItem'>,
  version: TestVersion = 'v1',
): void {
  tryRemoveItem(storage, getSessionStorageKeys(version).result)
}
```

- [ ] **步骤 5：运行纯函数和既有 Hook 回归并确认 GREEN**

运行：

```powershell
npm test -- src/lib/test-session.test.ts src/hooks/use-test-session.test.tsx
```

预期：全部通过；Hook 尚未传版本，因此现阶段仍完整走默认 V1。

- [ ] **步骤 6：提交存储隔离**

```powershell
git add -- src/lib/test-session.ts src/lib/test-session.test.ts
git commit -m "feat: isolate chakra v2 sessions"
```

---

### 任务 4：把版本贯穿客户端会话与提交

**文件：**

- 修改：`src/hooks/use-test-session.test.tsx:1-652`
- 修改：`src/hooks/use-test-session.ts:1-245`
- 修改：`src/app/page.test.tsx:35-75`

**接口：**

- 消费：`resolveTestVersion`、`TestVersion`
- 消费：任务 2 的版本化计分函数
- 消费：任务 3 的版本化存储函数与 `getSessionStorageKeys`
- 产出：`useTestSession()` 返回 `version: TestVersion | null`

- [ ] **步骤 1：让测试助手能指定路径和版本键**

把 `src/hooks/use-test-session.test.tsx` 现有的 `@/lib/test-session` 导入替换为：

```ts
import {
  getSessionStorageKeys,
  SESSION_STORAGE_KEYS,
  type Answers,
  type StoredResult,
} from '@/lib/test-session'
import type { TestVersion } from '@/lib/test-version'
```

新增路径助手，并替换 `setProgress`：

```ts
function setTestPathname(pathname: string) {
  window.history.replaceState({}, '', pathname)
}

function setProgress(
  answers: Answers,
  currentQuestion: number,
  version: TestVersion = 'v1',
) {
  const keys = getSessionStorageKeys(version)
  window.localStorage.setItem(keys.answers, JSON.stringify(answers))
  window.localStorage.setItem(keys.currentQuestion, String(currentQuestion))
}
```

把两个 describe 的生命周期钩子分别改为以下内容，防止 V2 路径污染后续测试：

```ts
// useTestSession 恢复、保存与导航
beforeEach(() => {
  setTestPathname('/chakras')
  window.localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  window.localStorage.clear()
  setTestPathname('/chakras')
})

// useTestSession 提交、失败与竞态
beforeEach(() => {
  setTestPathname('/chakras')
  window.localStorage.clear()
  window.localStorage.setItem('chakra-device-id', 'device-test-fixed')
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  window.localStorage.clear()
  setTestPathname('/chakras')
})
```

同时在 `src/app/page.test.tsx` 的 `createSession` 默认对象首部增加 `version: 'v1'`。该夹具使用 `ReturnType<typeof useTestSession>`，必须与 Hook 新增的必有返回字段在同一任务保持类型一致：

```ts
const session: Session = {
  version: 'v1',
  pageState: 'welcome',
  currentQuestion: 0,
  answers: {},
  result: null,
  backupStatus: 'idle',
  storageWarning: null,
  progressInfo: { answered: 0, total: 56, percentage: 0, completed: false },
  ...callbacks,
  ...overrides,
}
```

- [ ] **步骤 2：写未解析状态与 V2 完整提交失败测试**

把现有 SSR 用例收紧为：

```tsx
it('服务端首次渲染保持版本未解析，且不会读取浏览器存储', () => {
  const getItem = vi.spyOn(Storage.prototype, 'getItem')

  function Probe() {
    const session = useTestSession()
    return `${session.pageState}:${String(session.version)}`
  }

  expect(renderToString(<Probe />)).toContain('booting:null')
  expect(getItem).not.toHaveBeenCalled()
})
```

在提交 describe 中追加：

```tsx
it('在 /chakra 只恢复和写入 V2，并向现有 API 提交同一份 V2 分数', async () => {
  setTestPathname('/chakra')
  const v1Keys = getSessionStorageKeys('v1')
  const v2Keys = getSessionStorageKeys('v2')
  const v1Answers = JSON.stringify({ 1: 4, 2: 4 })
  window.localStorage.setItem(v1Keys.answers, v1Answers)
  window.localStorage.setItem(v1Keys.currentQuestion, '1')
  window.localStorage.setItem(THEME_KEY, 'dark')

  const v2Answers: Answers = Object.fromEntries(
    Array.from({ length: 56 }, (_, index) => [index + 1, 2]),
  )
  v2Answers[2] = 0
  v2Answers[3] = 0
  setProgress(v2Answers, 55, 'v2')

  const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(
    async () => successfulResponse(),
  )
  vi.stubGlobal('fetch', fetchMock)

  const { result } = renderSession()
  await waitFor(() => expect(result.current.pageState).toBe('welcome'))
  expect(result.current.version).toBe('v2')
  expect(result.current.answers).toEqual(v2Answers)

  await act(async () => result.current.submit())

  expect(fetchMock).toHaveBeenCalledTimes(1)
  const [url, options] = fetchMock.mock.calls[0]
  const body = JSON.parse(options!.body as string)
  expect(url).toBe('/chakras/api/test-results')
  expect(Object.keys(body).sort()).toEqual(['answers', 'deviceId', 'scores'])
  expect(result.current.result?.scores.海底轮).toBe(45)
  expect(body.scores).toEqual(result.current.result?.scores)
  expect(JSON.parse(window.localStorage.getItem(v2Keys.result)!)).toEqual(result.current.result)
  expect(window.localStorage.getItem(v2Keys.answers)).toBeNull()
  expect(window.localStorage.getItem(v2Keys.currentQuestion)).toBeNull()
  expect(window.localStorage.getItem(v1Keys.answers)).toBe(v1Answers)
  expect(window.localStorage.getItem(v1Keys.currentQuestion)).toBe('1')

  act(() => result.current.restart())
  expect(window.localStorage.getItem(v2Keys.result)).toBeNull()
  expect(window.localStorage.getItem(v1Keys.answers)).toBe(v1Answers)
  expect(window.localStorage.getItem(v1Keys.currentQuestion)).toBe('1')
  expect(window.localStorage.getItem(THEME_KEY)).toBe('dark')
})
```

- [ ] **步骤 3：运行 Hook 测试并确认 RED**

运行：

```powershell
npm test -- src/hooks/use-test-session.test.tsx
```

预期：SSR 用例收到 `booting:undefined`；V2 用例错误恢复 V1 数据，且返回值没有 `version`。

- [ ] **步骤 4：在 Hook 中先解析版本再访问存储**

在 `src/hooks/use-test-session.ts` 增加：

```ts
import { resolveTestVersion, type TestVersion } from '@/lib/test-version'
```

在来自 `@/lib/test-session` 的现有导入列表中删除 `SESSION_STORAGE_KEYS`，增加 `getSessionStorageKeys`。

在会话状态和 ref 中增加：

```ts
const [version, setVersion] = useState<TestVersion | null>(null)
const versionRef = useRef<TestVersion | null>(null)
```

把 `sessionKeysAreCleared` 改为：

```ts
function sessionKeysAreCleared(storage: Storage, version: TestVersion): boolean {
  try {
    return Object.values(getSessionStorageKeys(version)).every((key) => storage.getItem(key) === null)
  } catch {
    return false
  }
}
```

用以下完整代码替换启动 effect，让同一局部版本贯穿恢复和事件闭包：

```ts
useEffect(() => {
  const resolvedVersion = resolveTestVersion(window.location.pathname)
  versionRef.current = resolvedVersion
  setVersion(resolvedVersion)

  const storage = getStorage()
  const restored = storage
    ? restoreSession(storage, resolvedVersion)
    : { kind: 'empty' as const }

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
```

`persistProgress` 在访问 localStorage 前先取得已解析版本：

```ts
const persistProgress = (nextAnswers: Answers, nextQuestion: number) => {
  const activeVersion = versionRef.current
  if (activeVersion === null) return false

  const storage = getStorage()
  if (!storage || !saveProgress(storage, nextAnswers, nextQuestion, activeVersion)) {
    setStorageWarning(PROGRESS_WARNING)
    return false
  }
  setStorageWarning((warning) => warning === PROGRESS_WARNING ? null : warning)
  return true
}
```

- [ ] **步骤 5：让重测和提交使用同一已解析版本**

在 `resetSession` 开头增加空版本保护，并把所有存储调用改为显式版本：

```ts
const resetSession = (nextPageState: 'welcome' | 'test') => {
  const activeVersion = versionRef.current
  if (activeVersion === null) return

  sessionRef.current += 1
  submittingRef.current = false
  const storage = getStorage()
  if (storage) {
    clearProgress(storage, activeVersion)
    clearResult(storage, activeVersion)
  }
  const storageCleared = storage !== null && sessionKeysAreCleared(storage, activeVersion)
  updateAnswers({})
  updateCurrentQuestion(0)
  setResult(null)
  setBackupStatus('idle')
  setStorageWarning(storageCleared ? null : PROGRESS_WARNING)
  updatePageState(nextPageState)
}
```

在 `submit` 最前面取得版本，之后只使用该局部值：

```ts
const submit = async () => {
  const activeVersion = versionRef.current
  if (activeVersion === null || submittingRef.current) return
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
  const snapshotScores = Object.freeze(
    calculateAllChakraScores(snapshotAnswers, activeVersion),
  )
  const snapshot = Object.freeze({
    scores: snapshotScores,
    answers: snapshotAnswers,
    completedAt: new Date().toISOString(),
  })

  const storage = getStorage()
  if (storage && saveResult(storage, snapshot, activeVersion)) {
    clearProgress(storage, activeVersion)
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
```

最后在 Hook 返回对象首部增加 `version`：

```ts
return {
  version,
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
```

不要把版本加入 `StoredResult` 或 API 请求体。

- [ ] **步骤 6：运行 Hook 与依赖回归并确认 GREEN**

运行：

```powershell
npm test -- src/lib/test-version.test.ts src/lib/chakra-data.test.ts src/lib/test-session.test.ts src/hooks/use-test-session.test.tsx
npx tsc --noEmit
```

预期：测试全部通过，TypeScript 无诊断；V1 既有恢复、保存、失败和竞态测试保持不变，V2 集成用例通过。

- [ ] **步骤 7：提交会话版本接线**

```powershell
git add -- src/hooks/use-test-session.ts src/hooks/use-test-session.test.tsx src/app/page.test.tsx
git commit -m "feat: route chakra v2 sessions"
```

---

### 任务 5：把版本传给结果页分享

**文件：**

- 修改：`src/components/result-page.test.tsx:1-532`
- 修改：`src/components/result-page.tsx:1-300`
- 修改：`src/app/page.test.tsx:35-285`
- 修改：`src/app/page.tsx:80-91`

**接口：**

- 消费：任务 1 的 `TestVersion` 与 `getTestShareUrl`
- 消费：任务 4 的 `session.version: TestVersion | null`
- 产出：`ResultPage` 必传 `version: TestVersion`

- [ ] **步骤 1：写 V1/V2 分享和页面接线失败测试**

在 `src/components/result-page.test.tsx` 的 `renderHeartSolar` 默认 props 中加入：

```ts
version: 'v1',
```

该文件中两个直接渲染 `ResultPage` 的位置也都增加显式 V1 prop：

```tsx
<ResultPage
  version="v1"
  result={makeResult(FIXTURES[0].scores)}
  backupStatus="idle"
  storageWarning={null}
  onRestart={vi.fn()}
/>

<ResultPage
  version="v1"
  result={makeResult(fixture.scores)}
  backupStatus="idle"
  storageWarning={null}
  onRestart={vi.fn()}
/>
```

现有 V1 完整 `shareText` 常量和 Clipboard 成功用例继续断言 `/chakras`。在同一个分享 describe 中追加：

```tsx
it('V2 分享文本使用 /chakra 入口', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  setClipboard(writeText)
  renderHeartSolar({ version: 'v2' })

  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: '复制分享摘要' }))
    await Promise.resolve()
  })

  expect(writeText).toHaveBeenCalledWith(expect.stringContaining('https://yyry.studio/chakra'))
  expect(writeText).not.toHaveBeenCalledWith(expect.stringContaining('https://yyry.studio/chakras'))
})
```

任务 4 已让 `src/app/page.test.tsx` 的 `createSession` 默认返回 V1；在 Home 结果测试后追加：

```tsx
it('result 将 V2 会话版本传给分享文案', async () => {
  const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  })

  try {
    const { session } = createSession({
      version: 'v2',
      pageState: 'result',
      result: STORED_RESULT,
    })
    renderHome(session)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: '复制分享摘要' }))

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('https://yyry.studio/chakra'))
    expect(writeText).not.toHaveBeenCalledWith(expect.stringContaining('https://yyry.studio/chakras'))
  } finally {
    if (clipboardDescriptor) {
      Object.defineProperty(navigator, 'clipboard', clipboardDescriptor)
    } else {
      Reflect.deleteProperty(navigator, 'clipboard')
    }
  }
})
```

- [ ] **步骤 2：运行结果页和页面测试并确认 RED**

运行：

```powershell
npm test -- src/components/result-page.test.tsx src/app/page.test.tsx
```

预期：V2 两个用例都收到硬编码的 `/chakras` 分享地址。

- [ ] **步骤 3：让 ResultPage 显式消费版本**

在 `src/components/result-page.tsx` 增加：

```ts
import { getTestShareUrl, type TestVersion } from '@/lib/test-version'
```

把分享构造函数改为：

```ts
function buildShareText(
  displayName: string,
  headline: string,
  people: string,
  shareUrl: string,
) {
  return `我的脉轮人物原型：${displayName}\n\n${headline}\n\n代表人物参考：${people || '当前原型暂无人物参考'}\n\n${shareUrl}`
}
```

给 `ResultPage` 增加必传 `version`，并替换生成文案的调用；函数其余行不改：

```diff
 export function ResultPage({
   result,
+  version,
   backupStatus,
   storageWarning,
   onRestart,
 }: {
   result: StoredResult
+  version: TestVersion
   backupStatus: BackupStatus
   storageWarning: string | null
   onRestart(): void
 }): React.ReactNode {

-  const shareText = buildShareText(displayName, displayHeadline, formatArchetypePeople(people))
+  const shareText = buildShareText(
+    displayName,
+    displayHeadline,
+    formatArchetypePeople(people),
+    getTestShareUrl(version),
+  )
```

- [ ] **步骤 4：由 Home 传递非空版本**

把 `src/app/page.tsx` 的结果分支改为同时检查结果和版本：

```tsx
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
```

- [ ] **步骤 5：运行组件、页面和 Hook 回归并确认 GREEN**

运行：

```powershell
npm test -- src/components/result-page.test.tsx src/app/page.test.tsx src/hooks/use-test-session.test.tsx
npx tsc --noEmit
```

预期：测试全部通过，TypeScript 无诊断；V1 完整分享文本仍以 `/chakras` 结尾，V2 以 `/chakra` 结尾。

- [ ] **步骤 6：提交结果页接线**

```powershell
git add -- src/components/result-page.tsx src/components/result-page.test.tsx src/app/page.tsx src/app/page.test.tsx
git commit -m "feat: share chakra v2 results"
```

---

### 任务 6：完整验证与双入口本地验收

**文件：**

- 临时创建并删除：`tmp/chakra-v2-proxy.mjs`
- 临时创建并删除：`tmp/chakra-v2-stop`
- 不提交任何临时代理、日志、截图或 `.next` 产物

**接口：**

- 消费：任务 1 至 5 的完整实现
- 产出：自动化验证证据、双入口本地验收证据和线上 Nginx 明确交付边界

- [ ] **步骤 1：运行全部自动化检查**

依次运行并保存退出码与失败数：

```powershell
npm test
npm run lint
npx tsc --noEmit
npm run build
git diff --check
```

预期：所有命令退出码为 `0`；测试无失败，ESLint 无错误，TypeScript 无诊断，生产构建成功，diff 无空白错误。

- [ ] **步骤 2：创建只用于本地验收的精确路径代理**

使用 `apply_patch` 新建 `tmp/chakra-v2-proxy.mjs`，内容如下：

```js
import http from 'node:http'

const server = http.createServer((request, response) => {
  const requestedUrl = new URL(request.url ?? '/', 'http://127.0.0.1:3200')
  let upstreamPath = ''

  if (requestedUrl.pathname === '/chakras/api/test-results') {
    response.writeHead(503, { 'content-type': 'application/json; charset=utf-8' })
    response.end(JSON.stringify({ success: false }))
    return
  } else if (requestedUrl.pathname === '/chakra') {
    upstreamPath = `/chakras${requestedUrl.search}`
  } else if (requestedUrl.pathname === '/chakra/') {
    response.writeHead(308, { location: `/chakra${requestedUrl.search}` })
    response.end()
    return
  } else if (
    requestedUrl.pathname === '/chakras'
    || requestedUrl.pathname.startsWith('/chakras/')
  ) {
    upstreamPath = `${requestedUrl.pathname}${requestedUrl.search}`
  } else {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    response.end('Not found')
    return
  }

  const proxyRequest = http.request({
    hostname: '127.0.0.1',
    port: 3100,
    path: upstreamPath,
    method: request.method,
    headers: { ...request.headers, host: '127.0.0.1:3100' },
  }, (proxyResponse) => {
    response.writeHead(proxyResponse.statusCode ?? 502, proxyResponse.headers)
    proxyResponse.pipe(response)
  })

  proxyRequest.on('error', (error) => {
    response.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' })
    response.end(error.message)
  })
  request.pipe(proxyRequest)
})

server.listen(3200, '127.0.0.1')
```

- [ ] **步骤 3：启动 standalone 与临时代理**

通过一个持续运行的 `exec_command` 会话执行以下完整 PowerShell 守护块，并保存返回的会话 ID 为 `harnessSessionId`。守护块直接启动 `bun.exe`，避免停止 `npm.cmd` 后遗留子进程；所有启动、就绪等待和最长十分钟的验收窗口都在同一个外层 `try/finally` 中。即使后续验收中断或忘记发送停止信号，到达期限后也会自动停止进程并清理临时文件：

```powershell
$ErrorActionPreference = 'Stop'
$appProcess = $null
$proxyProcess = $null
$previousPort = $env:PORT
$tmpRoot = (Resolve-Path -LiteralPath 'E:\root\chakras-yuanstudio\tmp').Path
$proxyCandidate = Join-Path $tmpRoot 'chakra-v2-proxy.mjs'
$stopCandidate = Join-Path $tmpRoot 'chakra-v2-stop'
$proxyPath = (Resolve-Path -LiteralPath $proxyCandidate).Path
if ((Split-Path -Parent $proxyPath) -ne $tmpRoot) {
  throw '临时代理路径超出 tmp 目录'
}

try {
  try {
    $env:PORT = '3100'
    $appProcess = Start-Process -FilePath 'bun.exe' -ArgumentList '.next/standalone/server.js' -WorkingDirectory 'E:\root\chakras-yuanstudio' -WindowStyle Hidden -PassThru
  } finally {
    if ($null -eq $previousPort) {
      Remove-Item Env:PORT -ErrorAction SilentlyContinue
    } else {
      $env:PORT = $previousPort
    }
  }

  $proxyProcess = Start-Process -FilePath 'node.exe' -ArgumentList 'tmp/chakra-v2-proxy.mjs' -WorkingDirectory 'E:\root\chakras-yuanstudio' -WindowStyle Hidden -PassThru

  $ready = $false
  for ($attempt = 0; $attempt -lt 60; $attempt += 1) {
    if ($appProcess.HasExited -or $proxyProcess.HasExited) {
      throw 'standalone 或本地代理进程提前退出'
    }
    $status = curl.exe -sS -o NUL -w "%{http_code}" http://127.0.0.1:3200/chakras
    if ($status -eq '200') {
      $ready = $true
      break
    }
    Start-Sleep -Milliseconds 500
  }
  if (-not $ready) { throw '本地双入口在 30 秒内未就绪' }

  Write-Output 'CHAKRA_V2_READY'
  $deadline = (Get-Date).AddMinutes(10)
  while (-not (Test-Path -LiteralPath $stopCandidate)) {
    if ((Get-Date) -ge $deadline) { throw '本地验收超过十分钟，自动清理' }
    if ($appProcess.HasExited -or $proxyProcess.HasExited) {
      throw 'standalone 或本地代理在验收期间提前退出'
    }
    Start-Sleep -Seconds 1
  }
} finally {
  if ($proxyProcess -and -not $proxyProcess.HasExited) {
    Stop-Process -Id $proxyProcess.Id -Force -ErrorAction SilentlyContinue
    Wait-Process -Id $proxyProcess.Id -ErrorAction SilentlyContinue
  }
  if ($appProcess -and -not $appProcess.HasExited) {
    Stop-Process -Id $appProcess.Id -Force -ErrorAction SilentlyContinue
    Wait-Process -Id $appProcess.Id -ErrorAction SilentlyContinue
  }
  if ($null -eq $previousPort) {
    Remove-Item Env:PORT -ErrorAction SilentlyContinue
  } else {
    $env:PORT = $previousPort
  }

  $cleanupPaths = @()
  foreach ($candidate in @($proxyCandidate, $stopCandidate)) {
    if (Test-Path -LiteralPath $candidate) {
      $resolved = (Resolve-Path -LiteralPath $candidate).Path
      if ((Split-Path -Parent $resolved) -ne $tmpRoot) {
        throw '临时验收文件路径超出 tmp 目录'
      }
      $cleanupPaths += $resolved
    }
  }
  foreach ($cleanupPath in $cleanupPaths) {
    Remove-Item -LiteralPath $cleanupPath
  }
}
```

以 `yield_time_ms: 10000` 启动该命令。预期工具返回仍在运行的会话 ID，且输出包含 `CHAKRA_V2_READY`；未看到该标记时不得开始浏览器验收。

- [ ] **步骤 4：验证精确路由和浏览器行为**

先运行：

```powershell
curl.exe -sS -o NUL -w "%{http_code}" http://127.0.0.1:3200/chakra
curl.exe -sS -o NUL -w "%{http_code}" "http://127.0.0.1:3200/chakra?source=v2"
curl.exe -sS -o NUL -D - "http://127.0.0.1:3200/chakra/?source=v2"
curl.exe -sS -L -o NUL -w "%{url_effective} %{http_code}" "http://127.0.0.1:3200/chakra/?source=v2"
curl.exe -sS -o NUL -w "%{http_code}" http://127.0.0.1:3200/chakrafoo
curl.exe -sS -o NUL -w "%{http_code}" http://127.0.0.1:3200/chakras
```

预期：前两项为 `200`；`/chakra/?source=v2` 返回 `308` 且 `Location` 为 `/chakra?source=v2`，跟随重定向后为 `http://127.0.0.1:3200/chakra?source=v2 200`；`/chakrafoo` 为 `404`；`/chakras` 为 `200`。

然后先读取并使用 `playwright-interactive` 技能，通过浏览器访问 `http://127.0.0.1:3200/chakra`：

- 地址栏保持 `/chakra`；
- 访问 `/chakra?source=v2` 后地址栏仍保留 `?source=v2`；
- 欢迎页正常进入，控制台无 hydration 错误；
- 在浏览器上下文先写入 V1 哨兵进度，再写入以下 V2 完整答案和题号 `55`：

```js
const v2Answers = Object.fromEntries(
  Array.from({ length: 56 }, (_, index) => [index + 1, 2]),
)
v2Answers[2] = 0
v2Answers[3] = 0
localStorage.setItem('chakra-test-answers', JSON.stringify({ 1: 4 }))
localStorage.setItem('chakra-test-current-question', '0')
localStorage.setItem('chakra-test-v2-answers', JSON.stringify(v2Answers))
localStorage.setItem('chakra-test-v2-current-question', '55')
```

- 刷新 `/chakra` 后恢复 V2 完整进度；继续并查看结果，海底轮显示 `+45%`；本地写入 `chakra-test-v2-result`，V1 哨兵键原值不变；
- 代理对 `/chakras/api/test-results` 固定返回 `503`，所以结果页应显示在线备份失败但本地结果可用，且验收请求不会进入数据库；
- 从 V2 本地结果复制同一份答案到 V1 进度键：

```js
const v2Result = JSON.parse(localStorage.getItem('chakra-test-v2-result'))
localStorage.setItem('chakra-test-answers', JSON.stringify(v2Result.answers))
localStorage.setItem('chakra-test-current-question', '55')
```

- 访问 `http://127.0.0.1:3200/chakras`，继续并查看结果，海底轮显示 `+25%`；V2 结果键仍存在；
- 在结果页确认 `/chakras/_next/*`、字体、二维码和人物图片无 404，并分别用 `1280x800`、`390x844` 视口确认没有新增布局差异或横向溢出。

不要绕过临时代理直连本地或线上 API。请求体一致性由任务 4 的 Hook 测试覆盖；临时代理只负责阻断数据库副作用并验证真实浏览器中的本地优先行为。

- [ ] **步骤 5：发送停止信号并确认 finally 完成清理**

无论步骤 4 成功或失败，都使用 `apply_patch` 新建以下停止信号；步骤 3 的守护块检测到它后，会在同一个外层 `finally` 中停止两个进程、恢复 `PORT` 并删除代理与停止信号：

```text
*** Begin Patch
*** Add File: E:\root\chakras-yuanstudio\tmp\chakra-v2-stop
+stop
*** End Patch
```

随后对 `harnessSessionId` 调用 `write_stdin`，不写入字符并等待最多 30 秒。预期守护会话以退出码 `0` 结束；若返回错误，先读取其 finally 输出并完成同样的精确清理，不能直接进入完成声明。

最后运行：

```powershell
git status --short
```

确认没有遗留 `tmp/chakra-v2-proxy.mjs`、`tmp/chakra-v2-stop`、本地服务进程、日志或构建产物。原有未跟踪 `tmp/` 内容必须保持不变。

- [ ] **步骤 6：检查实现范围和需求映射**

运行：

```powershell
git diff origin/master...HEAD --stat
git diff origin/master...HEAD -- src/lib/test-version.ts src/lib/chakra-data.ts src/lib/test-session.ts src/hooks/use-test-session.ts src/app/page.tsx src/components/result-page.tsx
git status --short
```

逐项确认：V1 默认不变、V2 只改海底轮、本地会话隔离、API body 无版本字段、分享地址按版本、无 Prisma/题库/CSS/basePath 修改。已知的未跟踪图片、设计稿和 `tmp/` 原有内容只报告，不清理、不提交。

- [ ] **步骤 7：明确线上 Nginx 交付边界**

仓库实现完成后，线上 `/chakra` 仍需要 Nginx 精确映射。当前任务没有服务器地址或 Nginx 配置权限，因此不得猜测上游、修改线上配置或宣称 `/chakra` 已上线。

最终交付必须说明：

- `/chakra` 使用精确匹配，内部改写到现有 `/chakras` 上游并保留查询参数；
- `/chakra/` 只精确重定向或内部改写，`/chakrafoo` 不得命中；
- 现有 `/chakras` location、静态资源和 API 配置不改；
- 获得实际服务器入口后，应先只读获取现有 `/chakras` location，再生成可直接应用且复用该上游的配置，经过用户确认后才执行线上修改与回读。

本步骤不创建提交；它只形成验证报告和后续部署所需的明确操作边界。
