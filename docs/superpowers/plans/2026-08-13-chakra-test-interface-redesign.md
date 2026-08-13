# 脉轮测试界面改版实施计划

> **供智能执行者使用：** 必须使用 `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans`，逐任务实施本计划。所有步骤使用复选框跟踪。

**目标：** 在不改变 56 道题、计分、原型映射、API 请求体和 `/chakras` 部署契约的前提下，完成已确认的东方编辑式浅/深主题改版，并以自动化测试、四个规定视口的浏览器验收及生产环境回读证明上线成功。

**架构：** 把当前集中在 `src/app/page.tsx` 的存储恢复、提交和竞态控制提取为可测试的纯函数与会话 Hook，页面只负责装配受控的欢迎、答题和结果组件。主题状态与测试会话完全独立，由根布局的首屏脚本和客户端 Provider 共同维护；正式题库、计分、原型数据和 API 保持为唯一业务来源。

**技术栈：** Next.js 16、React 19、TypeScript、Tailwind CSS 4、Radix Radio Group、Vitest、jsdom、Testing Library、Prisma、Next.js standalone、Bun。

**规格：** `docs/superpowers/specs/2026-08-13-chakra-test-interface-redesign-design.md`

## 全局约束

- 所有实现、测试说明和交付文档使用中文；技术说明优先使用通俗语言。
- 只修改本计划列出的文件；不处理当前工作区中无关的未跟踪素材、脚本、日志和临时目录。
- 保持 56 题、7 轮、每轮 8 题、5 档答案、原始 `-100..100` 分数和固定同分顺序不变。
- 保持 `femaleArchetypeCardCopy`、42 张正式女性人物图、二维码、罕见原型、免责声明和分享摘要行为不变。
- 保持 `POST /chakras/api/test-results` 的 `deviceId`、`scores`、`answers` 请求体和 Prisma schema 不变。
- 保持 `next.config.ts` 的 `basePath: "/chakras"`、standalone 构建和静态资源同步不变。
- 主题键固定为 `chakra-test-theme-v1`；答案、当前题号和结果继续兼容现有三个本地键。
- 鼠标或触控选答后 `250ms` 自动前进；键盘选答不自动前进。
- 新增行为严格遵守 RED → GREEN → REFACTOR；每个行为测试必须先因功能缺失而失败，再写最少实现使其通过。
- `npm run build` 忽略 TypeScript 错误，最终必须分别运行 `npm test`、`npm run lint`、`npx tsc --noEmit` 和 `npm run build`。
- 上线前只提交本次改版文件；不使用 `git add .`，不把无关未跟踪文件带入提交或部署。

---

## 文件结构

| 文件 | 职责 |
| --- | --- |
| `vitest.config.ts` | jsdom 测试环境、`@` 路径别名和测试初始化入口 |
| `src/test/setup.ts` | jest-dom、`matchMedia`、`ResizeObserver` 等统一测试环境 |
| `src/lib/theme.ts` | 主题值校验、优先级计算和安全持久化 |
| `src/lib/test-session.ts` | 答案/结果校验、恢复优先级、完整性判断和安全存储 |
| `src/hooks/use-test-session.ts` | 页面会话、提交快照、本地保存、在线备份状态和过期响应隔离 |
| `src/components/theme-provider.tsx` | 客户端主题状态、系统主题订阅和根节点同步 |
| `src/components/theme-toggle.tsx` | 可访问的主题切换按钮 |
| `src/components/test-shell.tsx` | 三屏共用背景、品牌导航和安全区 |
| `src/components/welcome-page.tsx` | 新测试/续答入口和七轮装饰图 |
| `src/components/question-page.tsx` | 可访问单选组、题目焦点、进度、自动前进与底部操作 |
| `src/components/result-page.tsx` | 章节式动态结果、人物参考、分享、咨询和重测 |
| `src/components/chakra-score-chart.tsx` | 有 0 中线、正负方向和文本等价内容的七轮图 |
| `src/components/chakra-archetype-avatar.tsx` | 正式人物图、固定比例与准确失败占位 |
| `src/app/page.tsx` | 仅装配主题外壳、会话 Hook 与三个受控页面 |
| `src/app/layout.tsx` | 元数据、首屏主题脚本和 Provider |
| `src/app/globals.css` | 本地字体、品牌/主题令牌、基础排版、焦点、响应式和减少动态 |
| `public/fonts/*.woff2` | 三份已核验的本地字体子集 |

---

### 任务 1：建立测试工具和业务回归基线

**文件：**

- 修改：`package.json`
- 修改：`package-lock.json`
- 新建：`vitest.config.ts`
- 新建：`src/test/setup.ts`
- 新建：`src/lib/chakra-data.test.ts`
- 新建：`src/lib/chakra-archetypes.test.ts`

**接口：**

- 消费：`calculateAllChakraScores(answers)`、`generateChakraArchetypeResult(scores)`。
- 产出：`npm test` 和统一 jsdom 测试环境；不修改任何业务函数。

- [ ] **步骤 1：安装最小测试依赖并生成锁文件变更**

运行：

```powershell
npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

在 `package.json` 增加：

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **步骤 2：加入 Vitest 与统一测试初始化**

`vitest.config.ts` 使用以下完整配置：

```ts
import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    clearMocks: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

`src/test/setup.ts` 导入 `@testing-library/jest-dom/vitest`，并提供可修改的 `window.matchMedia` 与空实现 `ResizeObserver`，确保主题和 Recharts 组件可稳定测试。

- [ ] **步骤 3：写计分与原型的特征回归测试**

至少覆盖：

```ts
it('保持 56 题全选中间项时的七轮计分结果')
it('按题目 scores 数组计算反向题')
it('固定分数得到固定的主导、辅助、最低轮和原型代码')
it('七轮同分时继续按固定轮序决定原型')
it('归一化后的分数始终位于 0 到 100')
```

这些测试记录现有行为，允许首次运行即通过；它们不是新增功能的 TDD 替代品。

- [ ] **步骤 4：运行回归基线**

运行：

```powershell
npm test -- src/lib/chakra-data.test.ts src/lib/chakra-archetypes.test.ts
```

预期：全部通过，且没有未处理的 Promise 或 React 警告。

- [ ] **步骤 5：只提交本任务文件**

```powershell
git add package.json package-lock.json vitest.config.ts src/test/setup.ts src/lib/chakra-data.test.ts src/lib/chakra-archetypes.test.ts
git commit -m "test: establish chakra redesign baseline"
```

---

### 任务 2：实现主题优先级、首屏防闪和品牌令牌

**文件：**

- 新建：`src/lib/theme.ts`
- 新建：`src/lib/theme.test.ts`
- 新建：`src/components/theme-provider.tsx`
- 新建：`src/components/theme-provider.test.tsx`
- 新建：`src/components/theme-toggle.tsx`
- 新建：`src/components/theme-toggle.test.tsx`
- 修改：`src/app/layout.tsx`
- 修改：`src/app/globals.css`
- 新建：`public/fonts/noto-serif-sc-home-400.woff2`
- 新建：`public/fonts/noto-sans-sc-home-400.woff2`
- 新建：`public/fonts/cormorant-garamond-latin-400.woff2`

**接口：**

- 产出：

```ts
export type Theme = 'light' | 'dark'
export const THEME_STORAGE_KEY = 'chakra-test-theme-v1'
export function isTheme(value: unknown): value is Theme
export function resolveInitialTheme(stored: unknown, systemDark: boolean): Theme
export function readStoredTheme(storage: Pick<Storage, 'getItem'>): Theme | null
export function writeStoredTheme(storage: Pick<Storage, 'setItem'>, theme: Theme): boolean
export function useTheme(): { theme: Theme; setTheme(theme: Theme): void; toggleTheme(): void }
```

- [ ] **步骤 1：写主题纯函数的失败测试**

测试必须断言：合法本地值优先；非法/缺失值跟随系统；无法读取时回退浅色；写入异常返回 `false` 而不抛错。

运行：

```powershell
npm test -- src/lib/theme.test.ts
```

预期：因 `@/lib/theme` 不存在而失败。

- [ ] **步骤 2：实现最小主题纯函数并跑绿**

只实现上述五个导出，不引入通用设置框架。

运行同一测试，预期全部通过。

- [ ] **步骤 3：写 Provider 与开关的失败测试**

覆盖：

```ts
it('没有手动选择时响应系统主题变化')
it('手动切换后持久化并停止跟随系统')
it('主题按钮有中文动作名称和 aria-pressed')
it('按 Enter 或空格可以切换主题')
```

预期：组件不存在而失败。

- [ ] **步骤 4：实现 Provider、开关和根布局首屏脚本**

`ThemeProvider` 只负责主题，不接触测试答案。`layout.tsx` 的 `<head>` 内联脚本须在 React 接管前读取 `chakra-test-theme-v1`，否则读取 `prefers-color-scheme`，最后把 `light`/`dark` 类与 `color-scheme` 写到 `<html>`；脚本中的存储读取必须被 `try/catch` 包裹。

`ThemeToggle` 的可见文字在桌面为“浅色”或“深色”，可访问名称表达下一步动作：“切换到深色模式”或“切换到浅色模式”。

- [ ] **步骤 5：接入品牌色、字体、焦点和减少动态**

从已核验来源 `E:\圆圆如意官网\public\fonts\` 复制三份同名字体到 `public/fonts/`。`globals.css` 增加规格中明确的品牌令牌、七轮业务色、浅深语义色、展示/正文字体、`2px` 焦点环、`4px` 偏移、安全区和 `prefers-reduced-motion` 规则；不在本任务改任何页面布局。

- [ ] **步骤 6：运行主题测试并检查类型**

```powershell
npm test -- src/lib/theme.test.ts src/components/theme-provider.test.tsx src/components/theme-toggle.test.tsx
npx tsc --noEmit
```

预期：全部通过，HTML 根节点类、按钮名称和系统主题订阅均有断言。

- [ ] **步骤 7：提交主题任务**

```powershell
git add src/lib/theme.ts src/lib/theme.test.ts src/components/theme-provider.tsx src/components/theme-provider.test.tsx src/components/theme-toggle.tsx src/components/theme-toggle.test.tsx src/app/layout.tsx src/app/globals.css public/fonts
git commit -m "feat: add persistent chakra themes"
```

---

### 任务 3：实现安全的恢复、完整性和存储规则

**文件：**

- 新建：`src/lib/test-session.ts`
- 新建：`src/lib/test-session.test.ts`

**接口：**

```ts
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

export const SESSION_STORAGE_KEYS: {
  answers: 'chakra-test-answers'
  currentQuestion: 'chakra-test-current-question'
  result: 'chakra-test-result'
}
export function sanitizeAnswers(value: unknown): Answers
export function sanitizeCurrentQuestion(value: unknown, answers: Answers): number
export function sanitizeStoredResult(value: unknown): StoredResult | null
export function findFirstMissingQuestion(answers: Answers): number | null
export function restoreSession(storage: Pick<Storage, 'getItem' | 'removeItem'>): RestoredSession
export function saveProgress(storage: Pick<Storage, 'setItem'>, answers: Answers, currentQuestion: number): boolean
export function saveResult(storage: Pick<Storage, 'setItem'>, result: StoredResult): boolean
export function clearProgress(storage: Pick<Storage, 'removeItem'>): void
export function clearResult(storage: Pick<Storage, 'removeItem'>): void
```

- [ ] **步骤 1：写损坏数据和恢复优先级的失败测试**

覆盖：题号仅 `1..56`、选项仅整数 `0..4`、当前索引 `0..55`、结果必须恰有七轮合法 `-100..100` 数值；非法答案只丢非法项；坏结果只清结果键；一个坏键不清其他合法数据。

恢复顺序必须断言：`1..55` 题合法进度优先于旧结果；56 题合法答案且无本地结果为 `completed`；没有进度才恢复合法旧结果；否则为 `empty`。

运行：

```powershell
npm test -- src/lib/test-session.test.ts
```

预期：模块不存在而失败。

- [ ] **步骤 2：实现纯函数与安全存储适配**

只接受现有七轮中文分数字段；所有 `JSON.parse`、`getItem`、`setItem`、`removeItem` 都在最小 `try/catch` 边界内。不要新增迁移框架或版本仓库。

- [ ] **步骤 3：验证完整性与恢复测试转绿**

运行同一测试，预期全部通过，并检查每个非法输入测试都没有抛异常。

- [ ] **步骤 4：提交会话规则**

```powershell
git add src/lib/test-session.ts src/lib/test-session.test.ts
git commit -m "feat: validate chakra test sessions"
```

---

### 任务 4：实现会话 Hook、提交快照和在线备份状态

**文件：**

- 新建：`src/hooks/use-test-session.ts`
- 新建：`src/hooks/use-test-session.test.tsx`

**接口：**

```ts
export type PageState = 'booting' | 'welcome' | 'test' | 'result'
export type BackupStatus = 'idle' | 'saving' | 'saved' | 'failed'
export type ProgressInfo = { answered: number; total: 56; percentage: number; completed: boolean }

export function useTestSession(): {
  pageState: PageState
  currentQuestion: number
  answers: Answers
  result: StoredResult | null
  backupStatus: BackupStatus
  storageWarning: string | null
  progressInfo: ProgressInfo
  start(): void
  continueTest(): void
  saveAndExit(): void
  selectAnswer(questionId: number, answerIndex: number): void
  goToQuestion(index: number): void
  submit(): Promise<void>
  restart(): void
}
```

- [ ] **步骤 1：写挂载恢复和提交顺序的失败测试**

使用 `renderHook` 与假的 Storage/fetch，覆盖：挂载前为 `booting`；挂载后按任务 3 的优先级恢复；选答先写入存储；本地结果写成功后才清进度；本地结果写失败时保留进度并显示结果；结果页在网络完成前立即出现且状态为 `saving`。

运行：

```powershell
npm test -- src/hooks/use-test-session.test.tsx
```

预期：Hook 不存在而失败。

- [ ] **步骤 2：写重复提交和过期响应的失败测试**

断言：不完整答案调用 `submit()` 不请求网络并跳到第一道遗漏；首次提交后第二次调用不再请求；旧会话网络响应晚到时不能覆盖重测后的新会话；非 JSON 响应视为 `failed`；数据库失败不删除本地结果。

- [ ] **步骤 3：实现最小会话 Hook**

提交时克隆答案、计算分数、创建 `{ scores, answers, completedAt }` 不可变快照，并用仅内存的递增会话标识过滤旧响应。API 请求仍发送：

```ts
{
  deviceId: getDeviceId(),
  scores: snapshot.scores,
  answers: snapshot.answers
}
```

不向请求体加入会话标识，不自动无限重试，不新增持久化队列。

- [ ] **步骤 4：运行 Hook 测试和会话规则测试**

```powershell
npm test -- src/lib/test-session.test.ts src/hooks/use-test-session.test.tsx
```

预期：全部通过；网络成功、失败、非 JSON、重复提交和旧响应都有独立断言。

- [ ] **步骤 5：提交会话 Hook**

```powershell
git add src/hooks/use-test-session.ts src/hooks/use-test-session.test.tsx
git commit -m "feat: isolate chakra test submission state"
```

---

### 任务 5：实现共用外壳与欢迎页

**文件：**

- 新建：`src/components/test-shell.tsx`
- 新建：`src/components/welcome-page.tsx`
- 新建：`src/components/welcome-page.test.tsx`
- 修改：`src/app/globals.css`

**接口：**

```ts
export function TestShell(props: {
  children: React.ReactNode
  middleLabel?: string
  actions?: React.ReactNode
}): React.ReactNode

export function WelcomePage(props: {
  progressInfo: ProgressInfo
  onStart(): void
  onContinue(): void
  onRestart(): void
}): React.ReactNode
```

- [ ] **步骤 1：写欢迎状态的失败测试**

断言：无进度只有“开始测试”主按钮；1..55 题显示“继续测试”、题数和百分比；56 题无结果显示“答案已完成，待查看结果”；“重新开始”是低强调操作；页面只有一个 `h1`；七轮同心图对辅助技术隐藏。

- [ ] **步骤 2：运行测试确认因组件缺失而失败**

```powershell
npm test -- src/components/welcome-page.test.tsx
```

- [ ] **步骤 3：实现东方编辑式共用外壳和欢迎页**

欢迎页桌面使用文字/七轮同心图两栏，移动端单列；只保留一个漆器红主操作。测试说明固定使用原生 `details/summary`，不建立弹窗状态机。导航左侧为“圆圆如意”，中间英文名在移动端隐藏，右侧复用 `ThemeToggle`。

- [ ] **步骤 4：运行欢迎页测试并提交**

```powershell
npm test -- src/components/welcome-page.test.tsx
git add src/components/test-shell.tsx src/components/welcome-page.tsx src/components/welcome-page.test.tsx src/app/globals.css
git commit -m "feat: redesign chakra welcome experience"
```

---

### 任务 6：实现可访问答题页和可取消自动前进

**文件：**

- 新建：`src/components/question-page.tsx`
- 新建：`src/components/question-page.test.tsx`
- 修改：`src/app/globals.css`

**接口：**

```ts
export function QuestionPage(props: {
  currentQuestion: number
  answers: Answers
  submitting: boolean
  onSelectAnswer(questionId: number, answerIndex: number): void
  onGoToQuestion(index: number): void
  onSaveAndExit(): void
  onSubmit(): void
}): React.ReactNode
```

- [ ] **步骤 1：写语义与导航的失败测试**

断言：选项是单选组；方向键和空格只选择不自动前进；鼠标选答先触发 `onSelectAnswer`，`249ms` 不前进，`250ms` 前进；上一题、下一题、暂存退出、提交和卸载都会取消待执行计时器。

- [ ] **步骤 2：写遗漏题与焦点的失败测试**

断言：最后一题已答才显示可用“查看结果”；不完整提交由会话层定位遗漏后，题目标题获得焦点；题号更新通过 `aria-live="polite"` 播报；禁用原因有文字；核心按钮/选项至少 `44px`。

- [ ] **步骤 3：运行失败测试**

```powershell
npm test -- src/components/question-page.test.tsx
```

预期：组件不存在而失败。

- [ ] **步骤 4：实现单列答题页**

复用 `src/components/ui/radio-group.tsx`，不要手写键盘导航。鼠标/触控自动前进通过组件内唯一 timeout 完成，并在所有导航动作和 `useEffect` 清理函数中取消。移动底栏使用 `env(safe-area-inset-bottom)`，正文底部留足滚动空间。

- [ ] **步骤 5：运行 fake timer 与真实用户事件测试**

```powershell
npm test -- src/components/question-page.test.tsx
```

预期：所有计时器都在测试结束时清空，没有 `act(...)` 警告。

- [ ] **步骤 6：提交答题页**

```powershell
git add src/components/question-page.tsx src/components/question-page.test.tsx src/app/globals.css
git commit -m "feat: redesign accessible chakra questions"
```

---

### 任务 7：实现章节式结果报告、图表和分享回退

**文件：**

- 新建：`src/components/chakra-score-chart.tsx`
- 新建：`src/components/result-page.tsx`
- 新建：`src/components/result-page.test.tsx`
- 修改：`src/components/chakra-archetype-avatar.tsx`
- 新建：`src/components/chakra-archetype-avatar.test.tsx`
- 修改：`src/app/globals.css`

**接口：**

```ts
export function ChakraScoreChart(props: {
  scores: ChakraScores
  primaryName: string
  secondaryName: string
  lowestName: string
}): React.ReactNode

export function ResultPage(props: {
  result: StoredResult
  backupStatus: BackupStatus
  storageWarning: string | null
  onRestart(): void
}): React.ReactNode
```

- [ ] **步骤 1：写三组动态结果与人物图失败测试**

为 Heart-Solar、Sacral-Throat、ThirdEye-Root 三组分数断言：展示名、标题覆盖、主导/辅助/最低轮、四项摘要、三位代表人物和原型图片路径随数据变化；Hero 图片使用 `/chakras/archetypes/female/<slug>.png`、准确替代文字和 `object-contain`；加载失败显示“人物原型图片暂时无法显示”。

- [ ] **步骤 2：写数据图和分享失败测试**

断言：图表显示七轮名称、带正负号数值、0 中线、三种文字角色；同时存在同顺序文本等价内容。复制成功显示“已复制，可粘贴分享给好友”并由 `aria-live` 播报；Clipboard API 不可用时用受控文本回退；两种方式都失败时显示可选择文本和明确提示。

- [ ] **步骤 3：运行失败测试**

```powershell
npm test -- src/components/result-page.test.tsx src/components/chakra-archetype-avatar.test.tsx
```

- [ ] **步骤 4：实现章节式报告**

按固定顺序呈现：结论 Hero → 四项摘要 → 独立代表人物 → 七轮数据与依据 → 公开深度摘要/罕见提示 → 分享/二维码/重测 → 免责声明。优势、阴影和公开摘要只能读取 `archetypeResult.strengths`、`shadow`、`summary`；不显示咨询后才开放的完整 `relationshipMode`、`workMode`、`recommendations`。

桌面 Hero 的人物图列宽在 `>=1024px` 时占首段至少 52%、最大 `520px`；移动端 100%。移除 Avatar Hero 的网页渐变、边框、内边距、环、重阴影和 `mix-blend-multiply`，保留固定比例、`sizes`、优先加载和失败占位。

- [ ] **步骤 5：实现保存状态和真实操作边界**

`saving` 显示“正在备份结果”；`saved` 显示“结果已在线备份”；`failed` 显示“结果已保存在当前设备，在线备份暂未完成”。二维码使用 `/chakras/qrcode.png`，替代文字固定为“添加圆圆微信以咨询完整分析的二维码”。桌面顶部文字快捷入口和底部按钮调用同一分享/重测行为；移动端隐藏顶部快捷入口。

- [ ] **步骤 6：运行结果页测试并提交**

```powershell
npm test -- src/components/result-page.test.tsx src/components/chakra-archetype-avatar.test.tsx
git add src/components/chakra-score-chart.tsx src/components/result-page.tsx src/components/result-page.test.tsx src/components/chakra-archetype-avatar.tsx src/components/chakra-archetype-avatar.test.tsx src/app/globals.css
git commit -m "feat: redesign chakra result report"
```

---

### 任务 8：装配完整流程并删除旧内联实现

**文件：**

- 修改：`src/app/page.tsx`
- 新建：`src/app/page.test.tsx`

**接口：**

- 消费：`useTestSession()`、`TestShell`、`WelcomePage`、`QuestionPage`、`ResultPage`。
- 产出：`Home` 只按 `pageState` 渲染一个屏幕；不再包含存储、计分、图表或分享实现。

- [ ] **步骤 1：写完整装配的失败测试**

覆盖：启动恢复完成前只显示“正在恢复测试”；空状态进入欢迎；合法进度进入续答欢迎；旧结果只在无进度时恢复；开始/暂存/继续/重测的页面状态正确；重测保留主题；提交后立即进入结果且网络失败不退回答题页。

- [ ] **步骤 2：运行失败测试**

```powershell
npm test -- src/app/page.test.tsx
```

预期：旧页面没有新的受控装配行为而失败。

- [ ] **步骤 3：用最小入口替换旧的 1000 行页面**

`page.tsx` 只保留：

```tsx
export default function Home() {
  const session = useTestSession()

  return (
    <TestShell>
      {/* 根据 session.pageState 渲染唯一屏幕 */}
    </TestShell>
  )
}
```

删除本次替换产生的无效导入和旧内联组件，不顺手修改题库、API、Prisma 或其他 UI 基础组件。

- [ ] **步骤 4：运行完整自动化验证**

```powershell
npm test
npm run lint
npx tsc --noEmit
```

预期：所有测试通过，ESLint 与 TypeScript 均为退出码 0，没有 React 水合、`act` 或未清计时器警告。

- [ ] **步骤 5：提交完整装配**

```powershell
git add src/app/page.tsx src/app/page.test.tsx
git commit -m "feat: assemble redesigned chakra test flow"
```

---

### 任务 9：生产构建与多视口浏览器验收

**文件：**

- 仅在发现本次改版缺陷时修改对应任务文件。
- 生成的截图和日志放入 `tmp/`，不提交。

**验收入口：** 本地生产模式 `http://localhost:<可用端口>/chakras`；API 为 `/chakras/api/health`。

- [ ] **步骤 1：运行完整生产构建**

```powershell
npm test
npm run lint
npx tsc --noEmit
npm run build
```

预期：四条命令全部退出码 0；standalone 中存在 `.next/static`、`public/fonts`、`public/qrcode.png` 和 `public/archetypes/female`。

- [ ] **步骤 2：启动本地生产构建并做资源冒烟检查**

使用不会覆盖用户日志的临时环境启动 standalone server。检查：

```text
GET /chakras                  -> 200
GET /chakras/api/health       -> 200 或明确的数据库依赖 500
GET /chakras/qrcode.png       -> 200
GET /chakras/fonts/*.woff2    -> 200
GET /chakras/archetypes/female/heart-solar.png -> 200
```

健康接口若因本地没有数据库返回 500，只记录为环境限制；页面与静态资源不得失败。

- [ ] **步骤 3：按四个规定视口检查欢迎、答题和结果**

使用浏览器自动化分别设置 `1440×900`、`1280×800`、`390×844`、`375×667`，每个视口检查：无横向滚动、触控目标至少 `44×44px`、人物图无裁切/跳动、移动底栏不遮选项、安全区有效。每个视口至少保存欢迎、答题、结果三张截图到 `tmp/chakra-redesign-qc/`。

- [ ] **步骤 4：检查主题、恢复、键盘和异常流程**

实际操作并记录：系统浅/深主题与手动持久化；1、55、56 题恢复；鼠标自动前进与键盘不自动前进；返回修改；遗漏定位；网络离线仍展示结果；复制正常/回退/失败；重测保留主题；200% 缩放；减少动态。

- [ ] **步骤 5：检查三个动态原型和控制台**

使用三组固定本地结果触发 Heart-Solar、Sacral-Throat、ThirdEye-Root，核对人物名、图、四项摘要、三人参考、七轮角色和分享摘要。浏览器控制台不得有阻塞使用的错误。

- [ ] **步骤 6：修复发现的问题并重新跑完整验证**

每个行为缺陷先补失败测试，再写最小修复。任何改动后重新运行：

```powershell
npm test
npm run lint
npx tsc --noEmit
npm run build
```

- [ ] **步骤 7：提交验收修复（仅在有改动时）**

```powershell
git add <仅本次修复文件>
git commit -m "fix: address chakra redesign acceptance gaps"
```

---

### 任务 10：范围复核、推送上线和生产回读

**文件：**

- 不新增部署配置；仓库没有可证实的服务器编排文件。

**上线边界：** 现有证据支持 `origin/master`、Next.js standalone 和候选生产地址 `https://yyry.studio/chakras`（若 HTTPS 不可用再验证现有 `http://yyry.studio/chakras`）。推送前必须确认提交范围；推送后以实际在线版本回读为准，不能把“推送成功”当成“上线成功”。

- [ ] **步骤 1：逐条复核规格覆盖**

建立 19 个规格章节到实现/测试的映射，重点确认：主题、恢复顺序、提交竞态、三屏结构、正式人物图、分享回退、四视口、键盘、减少动态、`/chakras` 资源路径均有证据。发现缺口时回到对应任务，不带缺口上线。

- [ ] **步骤 2：审查提交与工作区范围**

```powershell
git status --short
git diff origin/master...HEAD --stat
git diff origin/master...HEAD --check
git log --oneline origin/master..HEAD
```

预期：提交只包含设计规格、实施计划和本次改版文件；当前已有的无关未跟踪文件仍未提交。

- [ ] **步骤 3：运行上线前最后一次新鲜验证**

```powershell
npm test
npm run lint
npx tsc --noEmit
npm run build
```

只有四条命令都以退出码 0 完成，才允许推送。

- [ ] **步骤 4：推送已验证的 `master`**

```powershell
git push origin master
```

若远端领先，先停止并审查远端新提交，不使用强制推送。若推送不能触发现有部署，必须明确报告缺失的部署平台/服务器权限，不猜测 SSH、PM2、systemd 或 Nginx 命令。

- [ ] **步骤 5：等待实际部署并回读生产**

在有限时间内轮询，不无限等待；每次检查版本页面和静态资源，直到新界面可见。验证：

```text
GET /chakras                         -> 200
GET /chakras/api/health              -> 200 且 JSON status 为 ok
GET /chakras/qrcode.png              -> 200
GET /chakras/fonts/*.woff2           -> 200
GET /chakras/archetypes/female/...   -> 200
```

随后在生产的桌面与移动视口各完成一次欢迎 → 作答 → 结果 → 分享/重测冒烟流程，并确认控制台无阻塞错误。

- [ ] **步骤 6：确认回滚点与最终交付**

记录上线提交 SHA、上线时间、生产 URL、健康检查响应、自动化命令结果和浏览器验收截图。若生产验证失败且可确认部署平台支持回滚，恢复到上线前已验证提交并重新检查健康接口；没有可证实的回滚机制时不执行猜测性破坏操作。

最终只有同时满足以下条件才完成目标：

```text
自动化测试通过
ESLint 通过
TypeScript 检查通过
生产构建通过
四视口本地验收通过
生产页面和资源回读通过
生产健康检查为 ok
生产核心流程冒烟通过
```
