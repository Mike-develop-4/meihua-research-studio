# 观象 Apple 风格界面重塑 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在保留全部梅花易数功能的前提下，将现有 React 界面重塑为精致、响应式的 Apple 风格产品界面。

**Architecture:** 保留现有组件和领域逻辑，通过独立的 `apple-theme.css` 建立设计令牌和完整视觉覆盖；`App` 提供稳定主题标识，自动化测试约束主题挂载与核心业务流程，浏览器截图负责视觉保真验收。

**Tech Stack:** React 19、TypeScript、Vite、Vitest、Testing Library、CSS、Codex 内置 Browser。

---

### Task 1: 建立可测试的主题契约

**Files:**
- Modify: `tests/app.test.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: 写失败测试**

在首页测试中加入：

```tsx
expect(document.querySelector('.app-shell')).toHaveAttribute('data-visual-theme', 'apple')
```

- [ ] **Step 2: 验证 RED**

Run: `npm test -- tests/app.test.tsx`
Expected: FAIL，提示 `data-visual-theme` 不存在。

- [ ] **Step 3: 最小实现**

将根节点改为：

```tsx
<div className="app-shell" data-visual-theme="apple">
```

- [ ] **Step 4: 验证 GREEN**

Run: `npm test -- tests/app.test.tsx`
Expected: 4 tests passed。

### Task 2: 建立 Apple 设计系统与起卦流程

**Files:**
- Create: `src/apple-theme.css`
- Modify: `src/main.tsx`

- [ ] **Step 1: 建立设计令牌**

在 `apple-theme.css` 中定义真实白色、浅灰背景、Apple 蓝、系统字体、圆角、玻璃导航、环境阴影和统一控件高度，并以 `[data-visual-theme="apple"]` 限定作用域。

- [ ] **Step 2: 引入主题样式**

在 `src/main.tsx` 的基础样式之后加入：

```ts
import './styles.css'
import './apple-theme.css'
```

- [ ] **Step 3: 重塑起卦页**

覆盖 `.app-header`、`.casting-shell`、`.step-rail`、`.step-panel`、`.section-heading`、`.field`、`.form-grid`、`.button`、`.method-strip`、`.method-form`、`.review-journey` 和 `.calculation-box`，保持现有 DOM 与交互逻辑。

- [ ] **Step 4: 桌面首屏比较**

在 1373×755 打开问事页，检查导航玻璃感、内容宽度、表单层级、按钮位置和首屏完整性；修正所有可见偏差。

### Task 3: 重塑结果页和历史抽屉

**Files:**
- Modify: `src/apple-theme.css`

- [ ] **Step 1: 结果页样式**

覆盖 `.reading-workspace`、`.reading-toolbar`、`.verdict-panel`、`.score-dial`、`.reading-section`、`.journey-line`、`.reading-grid`、`.action-columns`、`.calculation-details` 和 `.evidence-ledger`，形成高对比总结区与开放式内容层级。

- [ ] **Step 2: 历史抽屉样式**

覆盖 `.drawer-backdrop`、`.history-drawer`、`.history-item`、`.favorite-button`、`.compare-check` 和 `.comparison-panel`，采用系统侧边面板与轻量列表语言。

- [ ] **Step 3: 核心交互验证**

依次执行“填写问题 → 自定义排盘 → 校验数源 → 生成完整解读 → 打开记录”，确认状态变化与原功能一致。

### Task 4: 响应式与可访问性收口

**Files:**
- Modify: `src/apple-theme.css`

- [ ] **Step 1: 820px 断点**

将起卦布局、结果网格和证据链折叠为单列；保证内容宽度不超过视口。

- [ ] **Step 2: 520px 断点**

为 390×844 优化标题、字段间距、按钮宽度、方法选择和结果页字号；保持触控目标不少于 44px。

- [ ] **Step 3: 动效与聚焦**

为按钮、输入和面板加入一致的 hover/focus/enter 状态，并在 `prefers-reduced-motion: reduce` 下关闭非必要动效。

- [ ] **Step 4: 移动端验证**

检查 `document.documentElement.scrollWidth <= window.innerWidth`，确认字段、说明和按钮无重叠，完成一次核心交互。

### Task 5: 完成前门禁

**Files:**
- Test: `tests/app.test.tsx`
- Test: `tests/analysis.test.ts`

- [ ] **Step 1: 全量自动化测试**

Run: `npm test`
Expected: 5 test files、30 tests 全部通过。

- [ ] **Step 2: 类型检查**

Run: `npm run typecheck`
Expected: exit 0，无 TypeScript 错误。

- [ ] **Step 3: 生产构建**

Run: `npm run build`
Expected: Vite build 成功，生成 `dist` 产物。

- [ ] **Step 4: 视觉保真复核**

使用 `view_image` 同时查看概念图和最新浏览器截图，逐项记录布局、字体、颜色、圆角、控件、间距、结果页和移动端八个比较点；修复所有可改进偏差后再交付。
