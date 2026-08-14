# 脉轮测试界面改版验收记录

日期：2026-08-14

规格：`docs/superpowers/specs/2026-08-13-chakra-test-interface-redesign-design.md`

计划：`docs/superpowers/plans/2026-08-13-chakra-test-interface-redesign.md`

最终规格修复基线：`cef90157fccaf39c4525e779879ca0bcf6a20f6c`

最终生产代码提交：`e00ed993a7ebcb9ab3188fa0c08786c9281f0c71`

## 1. 验收结论

本地实现、自动化检查、生产构建、四视口视觉检查、主要异常路径和真实生产回读均已通过。`yyry.studio` 的独立 Nginx VPS 已运行最终产品代码，生产页面、健康接口、核心资源以及桌面和移动端流程均完成验收，本记录状态为最终完成。

本次改版保持 56 道题、计分、原型匹配和 API 请求体不变，完成浅深主题、欢迎/答题/结果三屏重构、正式人物图、可访问单选组、本地恢复、分享回退和数据库失败降级。最终复审又关闭欢迎页信息结构、平板/移动布局、深色主操作、七轮业务色、JSON `null` 结果清理和移动结果 Hero 顺序等规格偏差；其中每个行为修复均有先失败后通过的回归测试。

## 2. 设计裁定

1. 完整答案与合法结果同时存在时优先恢复结果。完整答案通常是结果写入成功但清进度前关闭页面的残留；优先结果可避免已完成测试回到待提交。代价是极低概率显示与残留答案不同步的旧结果，用户仍可重测。
2. 不重复合并或挑取 `c36528e`。本地审查时它是 `HEAD` 与 `origin/master` 的共同基线，旧结果页提交已经在祖先链中。本裁定只描述该审查基线；推送前仍需重新获取远端并核对拓扑。
3. `welcome` 状态直接返回自带 `TestShell` 的 `WelcomePage`，不在入口重复包外壳；`booting`、`test`、`result` 各由入口包一层，保证每屏只有一个导航、`main` 和 `h1`。
4. `booting` 用服务端首次渲染断言，客户端 effect 后的欢迎状态用真实 Hook 验证。Testing Library 的客户端 `render()` 不能可靠观察同步 effect 前的瞬间；主题层另有真实 SSR 到 hydrate 覆盖，浏览器验收补充首屏检查。

此前的延后项已在后续提交或最终验收中关闭：进度警告恢复、结果态选答、恢复/二次提交/旧响应竞态、radio 与选项文字 pointer 路径、减少动态滚动和图表越界钳制均已有直接回归。旧式 `matchMedia.addListener`、夹具字面量独立性和主题文字 SSR 风险经最终审查裁定不影响当前现代浏览器目标和现有 SSR/hydrate 覆盖。

## 3. 自动化与构建

最终复跑时间：2026-08-14 04:18–04:19（Asia/Shanghai）。

| 检查 | 结果 |
| --- | --- |
| `npm test` | 退出码 0；13 个测试文件，149/149 通过 |
| `npm run lint` | 退出码 0；无 ESLint 错误 |
| `npx tsc --noEmit --incremental false` | 退出码 0 |
| `npm run build` | 退出码 0；Next.js 16.1.6 生产构建成功，standalone 资源同步完成 |
| `git diff --check` | 退出码 0 |

Vitest 输出含 Vite 对未来 `configLoader: native` 的兼容提醒，不是当前失败。构建会把 `next-env.d.ts` 的类型入口改为生产目录；验收后已精确恢复仓库原值，避免提交生成副作用。

## 4. 本地生产运行与资源

本地 production standalone：`http://127.0.0.1:3318/chakras`。

| 资源 | HTTP |
| --- | --- |
| `/chakras` | 200 |
| `/chakras/qrcode.png` | 200 |
| `/chakras/logo.svg` | 200 |
| `/chakras/fonts/noto-serif-sc-home-400.woff2` | 200 |
| `/chakras/fonts/noto-sans-sc-home-400.woff2` | 200 |
| `/chakras/fonts/cormorant-garamond-latin-400.woff2` | 200 |
| `/chakras/archetypes/female/heart-solar.png` | 200 |
| `/chakras/archetypes/female/sacral-throat.png` | 200 |
| `/chakras/archetypes/female/third-eye-root.png` | 200 |
| `/chakras/api/health` | 本地 500；本机没有 `DATABASE_URL`，只记录为环境限制；生产已单独验证为 200 且数据库已连接 |

standalone 根入口、`.next/static`、`public`、三份字体、二维码、Logo 和三张验收人物图均存在。最终浏览器日志与调试协议事件为空，没有非预期控制台错误。

## 5. 浏览器功能验收

- 主题：无本地选择时首次跟随系统；未手动时系统浅深变化实时生效；手动选择后刷新、欢迎、答题、结果和重测均保持；主题键不被会话清理。
- 欢迎与恢复：新用户开始、24/56 续答、56/56 待查看均正确；重新开始取消时保留进度，确认后清理；原生 `details` 可展开和折叠。
- 作答：鼠标和 `pointerType=touch` 均先保存，约 250ms 后只前进一题；键盘方向键/空格只选答，400ms 后不自动跳题，明确点击下一题才前进；新题标题获得焦点。
- 计时器与回改：上一题、下一题、立即退出均取消旧自动前进；返回可见旧答案，修改后覆盖本地答案。
- 完整性：56/56 恢复到末题并可查看结果；55/56 提交被阻止，定位首个遗漏题，显示“还有 1 题未完成”，不生成结果。
- 完整键盘流程：在 `1280×800` 新鲜生产构建中连续完成 56 题；每题以空格选中单选项，再用 Enter 触发“下一题”，末题用 Enter 触发“查看结果”。抽查第 1、2、55、56 题均为选中后操作可用；结果缓存包含 56 个答案、进度键已清理，并显示“你的脉轮人物原型报告”。
- 最终生产回归：在提交 `e00ed99` 上再次以真实鼠标输入完成 56 题；末题提交前 `scrollY=294`，结果出现后为 `0`，报告主标题 `top=195`，人物图宽度有效，状态为“结果已在线备份”，控制台无警告或错误。
- 滚动恢复：页面状态切换在绘制前归顶；`390×844` 生产结果页从底部 `scrollY=3160` 刷新后，连续 12 次、约 1.2 秒采样均保持 `scrollY=0`，没有再次恢复旧位置。移动端报告保持结论在前、人物图在后，两列摘要和隐藏顶部快捷操作均正确。
- 故障降级：进度写入失败仍可在内存答题并显示丢失警告；`1280×800` 只显示桌面导航“退出测试”，`390×844` 只显示移动正文“退出测试”，均不再承诺暂存且没有横向溢出；结果写入失败仍立即显示结果、保留 56 道进度并提示；在线 API 被阻断时结果仍显示，本地结果已保存，状态变为在线备份未完成。
- 结果动态性：Heart-Solar 显示“老好人/温柔领导者”；Sacral-Throat 显示“灵感喷泉/灵感表达者”；ThirdEye-Root 显示“现实雷达员/现实洞察者”。主导、辅助和最低轮随分数变化，不是硬编码示例。
- 人物图：正式女性图的路径、替代文字和比例正确；桌面宽度 520px；外层无边框、阴影、渐变或内边距；模拟加载失败后保持同一尺寸并显示结果名和“人物原型图片暂时无法显示”。
- 图表与咨询：七轮表格有 8 行、三列表头和角色文本；二维码加载完成且替代文字正确；免责声明和品牌署名存在。
- 分享：Clipboard 成功分支实际捕获完整摘要；Clipboard 缺失时 `execCommand('copy')` 成功；两级失败时显示只读手动文本；成功反馈约 2 秒后复位。
- 动态与缩放：减少动态时程序化分享滚动使用 `auto`，CSS 动效时长为 0；`375×667`、200% 页面缩放和减少动态组合下无横向滚动，触控目标仍至少 44px，正文和固定底栏可滚动到达。

应用内浏览器明确不支持原生 `Input.dispatchTouchEvent`，因此触控验收采用真实页面 `PointerEvent(pointerType='touch')` 分支并与组件级 user-event/fake-timer 回归组合证明；浏览器实测在 120ms 仍停留原题，320ms 已进入下一题。

## 6. 四视口视觉证据

截图位于本地忽略目录 `tmp/chakra-redesign-qc/`，不提交二进制文件。原有 12 张中，移动 Hero 修复只影响两张结果页，因此于 03:20 对 `390×844` 与 `375×667` 结果页重新生成并逐张查看；两张均为结论在前、人物图在后，且无横向溢出。其余十张不受该 CSS 规则影响，保留此前逐张检查证据。

| 视口/状态 | 文件 | SHA-256 |
| --- | --- | --- |
| 1440×900 欢迎/深色 | `final-1440x900-welcome-dark.png` | `1df5c17c1bd28eece586e48f095cdcfb137f90c38d78f4feea0394ba01e49f88` |
| 1440×900 答题/深色 | `final-1440x900-question-dark.png` | `4f8758a97f2cd0cb64660069872eefa9468c54b5adf3acc8caf6e038e5490d70` |
| 1440×900 Heart-Solar/深色 | `final-1440x900-result-heart-solar-dark.png` | `886ddc3c08eddf0b0a476e9b740813c9ba769fc3d459b631ef53f8a3bdb3b69c` |
| 1280×800 续答欢迎/浅色 | `final-1280x800-welcome-resume-light.png` | `157e7119848732abd0f05d1a10887081b394f10422511af7b0a297b78527e9b6` |
| 1280×800 续答题/浅色 | `final-1280x800-question-resume-light.png` | `da1933e325cdf3c2b2ca7f0a58e9c49956fadde0b35b7f5cde540a178f927b23` |
| 1280×800 Heart-Solar/浅色 | `final-1280x800-result-heart-solar-light.png` | `cce86fa9fb9943d48fe3660f2a5443802ea817288bfff8f95395d35a32fb84f9` |
| 390×844 欢迎/浅色 | `final-390x844-welcome-light.png` | `26c225b04fe59959d079b25153286893d6c5313bcaaa7c5a6ded96ca5fddeca0` |
| 390×844 答题/浅色 | `final-390x844-question-light.png` | `2fe6ef5dedee61c2553fcfc28d996caab649817a8e6ff53f938274006a2400c6` |
| 390×844 Sacral-Throat/浅色 | `final-390x844-result-sacral-throat-light.png` | `224d15914412fa6d6e9c05a6e82fe42ac31ad79b62778e084241b83c9a565def` |
| 375×667 欢迎/深色 | `final-375x667-welcome-dark.png` | `3b8fa73bce557d312d7c28914a83ec07f16a5eecc36434258bc135251d90478c` |
| 375×667 答题/深色 | `final-375x667-question-dark.png` | `63f7c1ea75ee08045da6c0551ffe019a96c62b3ef96bdc1bf81cd46a1da9632e` |
| 375×667 ThirdEye-Root/深色 | `final-375x667-result-third-eye-root-dark.png` | `4278d2411cd9b27aed26c5dee05fb0ebe59ffe7ce76719eb9bd91626a849c7b6` |

## 7. 部署与生产回读

`yyry.studio` 与 Vercel 是两条并行发布链。权威 DNS 指向独立 Nginx VPS `8.147.62.5`，`/chakras` 代理到本机 `3000` 端口；因此 Vercel 的 Production deployment 不能代替目标域名验收。最终上线沿既有生产契约执行：远端仓库只允许已知的 `next-env.d.ts` 构建差异，随后 `git fetch`、`git merge --ff-only origin/master`、`npm run build`，构建成功后才执行 `pm2 restart chakras-yuanstudio --update-env`，未使用 `reset --hard`。

最终生产证据：

- 产品代码提交：`e00ed993a7ebcb9ab3188fa0c08786c9281f0c71`；本地 `HEAD`、`origin/master`、实时 GitHub `master` 和 VPS HEAD 在产品发布时一致；
- VPS BUILD_ID：`pQdpV7dVSwxyh26rQn0Ej`；PM2 进程 `chakras-yuanstudio` 状态 `online`，PID `2849278`，重启计数 `9`，不稳定重启为 `0`；
- `https://yyry.studio/chakras/api/health` 返回 200，正文为 `status=ok`、`database=connected`；
- 页面、健康接口、三份字体、二维码、Logo 和三张验收人物图共 10 项全部返回 200，类型与字节数合理；
- 桌面端完成 56 题、结果在线备份、分享反馈和重测；移动端完成结果首屏、刷新归顶、响应式顺序和无横向溢出检查；生产控制台没有阻断错误；
- 本地验收服务已停止，端口 `3318` 已释放；工作区没有 tracked 或 staged 残留，既有未跟踪内容未清理、未暂存。

验收记录的后续文档提交只更新证据，不改变上述产品代码，因此不要求再次构建或重启生产服务。
