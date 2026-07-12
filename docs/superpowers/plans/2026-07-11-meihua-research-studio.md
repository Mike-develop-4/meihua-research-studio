# 梅花易数研究台 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个具备六种起卦方式、可解释解卦证据链、本地卦例管理和响应式研究工作台的梅花易数网页应用。

**Architecture:** 使用 React + Vite + TypeScript。纯函数领域层负责排卦、体用、旺衰和规则化解读；React 特性层只负责输入状态、结果展示和本地历史，避免算法与界面耦合。

**Tech Stack:** React 18、TypeScript、Vite、Vitest、Testing Library、lunar-javascript、Lucide React、CSS design tokens。

---

### Task 1: 工程与测试基线

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/vite-env.d.ts`

- [ ] 写入 Vite、React、Vitest、Testing Library 和 lunar-javascript 依赖。
- [ ] 安装依赖并运行空测试命令，预期退出码为 0。
- [ ] 建立 `npm run dev`、`npm run build`、`npm run test`、`npm run typecheck` 命令。

### Task 2: 八卦与六十四卦核心

**Files:**
- Create: `tests/hexagrams.test.ts`
- Create: `src/domain/types.ts`
- Create: `src/data/trigrams.ts`
- Create: `src/data/hexagrams.ts`
- Create: `src/domain/hexagrams.ts`

- [ ] 先写失败测试，覆盖先天数映射、爻序、互卦、变卦和六十四卦名。
- [ ] 运行测试确认因模块不存在而失败。
- [ ] 实现不可变的八卦数据和 `buildHexagram`、`getMutualHexagram`、`getChangedHexagram`。
- [ ] 运行测试确认全部通过。

### Task 3: 六种起卦方式

**Files:**
- Create: `tests/casting.test.ts`
- Create: `src/domain/casting.ts`
- Create: `src/domain/lunar.ts`

- [ ] 先写失败测试，覆盖时间、两数、三数、文字取数、物数、物象方位和自定义排盘。
- [ ] 验证测试以缺少函数的正确原因失败。
- [ ] 使用农历年支数、农历月日和时支数实现时间起卦。
- [ ] 实现取余归一、输入校验和可展示计算步骤。
- [ ] 运行完整领域测试。

### Task 4: 体用、旺衰与证据链

**Files:**
- Create: `tests/analysis.test.ts`
- Create: `src/domain/elements.ts`
- Create: `src/domain/analysis.ts`
- Create: `src/data/category-guidance.ts`

- [ ] 先写失败测试，覆盖体用切换、五行生克、月令旺衰、体党用党和矛盾组合。
- [ ] 验证失败输出符合预期。
- [ ] 实现本、互、变三层关系和支持/压力证据。
- [ ] 实现不宿命化的综合判断、事项映射、行动建议和应期参考。
- [ ] 运行测试并确认“用克体”会根据体旺用衰得到“压力可控”而非固定大凶。

### Task 5: 本地记录与可复制报告

**Files:**
- Create: `tests/history.test.ts`
- Create: `src/domain/history.ts`
- Create: `src/domain/report.ts`

- [ ] 先写失败测试，覆盖记录序列化、版本迁移、摘要生成和最多保留 30 条。
- [ ] 实现纯函数存储格式和报告文本生成。
- [ ] 运行测试确认通过。

### Task 6: 起卦向导界面

**Files:**
- Create: `tests/app.test.tsx`
- Create: `src/App.tsx`
- Create: `src/components/AppHeader.tsx`
- Create: `src/components/StepRail.tsx`
- Create: `src/features/CastingWorkspace.tsx`
- Create: `src/features/QuestionStep.tsx`
- Create: `src/features/MethodStep.tsx`
- Create: `src/features/ReviewStep.tsx`

- [ ] 先写失败的渲染与交互测试，覆盖问题输入、事项类型、起卦方式切换和生成结果。
- [ ] 实现三步向导，所有输入有明确标签、校验和键盘焦点样式。
- [ ] 运行组件测试确认通过。

### Task 7: 解卦研究工作台

**Files:**
- Create: `src/features/ReadingWorkspace.tsx`
- Create: `src/components/HexagramGlyph.tsx`
- Create: `src/components/HexagramJourney.tsx`
- Create: `src/components/VerdictPanel.tsx`
- Create: `src/components/EvidenceLedger.tsx`
- Create: `src/components/AnalysisSections.tsx`
- Create: `src/components/HistoryDrawer.tsx`
- Create: `src/styles.css`

- [ ] 扩展失败的组件测试，要求结果页展示一句话总判、本互变、证据链和三组行动建议。
- [ ] 实现结果工作台和展开式研究区域。
- [ ] 实现复制、打印、保存、重新起卦和历史查看。
- [ ] 用设计令牌完成桌面与移动端布局，避免重复卡片网格。
- [ ] 运行组件测试和类型检查。

### Task 8: 构建、浏览器与视觉验收

**Files:**
- Create: `work/fidelity-ledger.md`
- Modify: `src/styles.css`

- [ ] 运行 `npm test`、`npm run typecheck` 和 `npm run build`。
- [ ] 启动本地网站，在浏览器中完成一次时间起卦和一次自定义排盘。
- [ ] 验证桌面端首屏、结果长页、历史面板和错误状态。
- [ ] 切换移动端视口，检查表单、卦象轨迹和右栏折叠。
- [ ] 截取最终界面并用本地图片查看工具检查文字、间距、颜色、图标、响应式和内容层级。
- [ ] 记录并修复 fidelity ledger 中所有可修复差异。
