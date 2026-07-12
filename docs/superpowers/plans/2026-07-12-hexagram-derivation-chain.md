# Hexagram Derivation Chain Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the three-line source summary with one reusable, testable derivation chain that explains source arithmetic, trigram mapping, main/mutual/changed hexagram construction, moving-line transformation, body/use assignment, and consistency checks.

**Architecture:** Add a pure domain builder that derives all display facts from `CastingResult` without changing persisted history. Render that model through one shared React component in both the review step and final reading, and reuse its summary in copied reports.

**Tech Stack:** TypeScript, React 19, Vitest, Testing Library, existing CSS/Apple theme.

---

## Spec coverage map

- 数源组成、除法取余、先天八卦映射：Tasks 1–2.
- 上下卦合成本卦、互卦取爻、动爻翻转与变卦：Tasks 1–2.
- 体用定位、五行关系和一致性异常：Tasks 1–2.
- 校验页与结果页共享、默认展开和解释边界：Task 3.
- 桌面/移动端布局与 Apple 视觉：Task 4.
- 报告摘要和旧历史记录兼容：Task 5.
- 自动化、构建和 390×844 浏览器验收：Task 6.

### Task 1: Build the pure derivation model

**Files:**
- Create: `src/domain/derivation.ts`
- Create: `tests/derivation.test.ts`

- [ ] **Step 1: Write failing tests for ordinary and zero remainders**

```ts
import { buildCastingDerivation } from '../src/domain/derivation'
import { castByTime } from '../src/domain/casting'

it('explains zero remainder normalization and pre-heaven trigram mapping', () => {
  const derivation = buildCastingDerivation(castByTime(new Date(2026, 6, 12, 12, 0, 0)))
  expect(derivation.trigramMappings).toMatchObject([
    { role: 'upper', rawRemainder: 0, normalizedValue: 8, trigram: { name: '坤' } },
    { role: 'lower', rawRemainder: 7, normalizedValue: 7, trigram: { name: '艮' } },
  ])
  expect(derivation.moving).toMatchObject({ position: 5, affectedSide: 'upper' })
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- tests/derivation.test.ts`

Expected: FAIL because `src/domain/derivation.ts` does not exist.

- [ ] **Step 3: Add tests for main, mutual, changed, body/use, and custom casting**

```ts
it('shows exactly how mutual and changed hexagrams are built', () => {
  const derivation = buildCastingDerivation(castCustom(8, 5, 3))
  expect(derivation.main).toMatchObject({ name: '地风升', lowerPositions: [1, 2, 3], upperPositions: [4, 5, 6] })
  expect(derivation.mutual).toMatchObject({ lowerPositions: [2, 3, 4], upperPositions: [3, 4, 5], name: '雷泽归妹' })
  expect(derivation.moving).toMatchObject({ position: 3, affectedSide: 'lower', before: 1, after: 0 })
  expect(derivation.bodyUse).toMatchObject({ bodySide: 'upper', useSide: 'lower', relation: '用克体' })
  expect(derivation.checks.every((item) => item.verified)).toBe(true)
})

it('marks custom casting as direct input instead of inventing arithmetic', () => {
  const derivation = buildCastingDerivation(castCustom(1, 8, 1))
  expect(derivation.sourceMode).toBe('direct')
  expect(derivation.trigramMappings).toEqual([])
})

it('reports the exact consistency failure instead of showing a false success state', () => {
  const casting = castCustom(1, 8, 1)
  const corrupted = { ...casting, changed: casting.main }
  const derivation = buildCastingDerivation(corrupted)
  expect(derivation.checks).toContainEqual(expect.objectContaining({ key: 'changed', verified: false }))
})
```

- [ ] **Step 4: Implement the minimal pure builder**

Create readonly interfaces for source mode, trigram mappings, numbered lines, mutual extraction, moving-line change, body/use, and verification checks. Implement:

```ts
export function buildCastingDerivation(casting: CastingResult): CastingDerivation {
  const lines = casting.main.lines.map((value, index) => ({
    position: index + 1,
    value,
    label: lineLabel(index + 1, value),
  }))
  const affectedSide = casting.movingLine <= 3 ? 'lower' : 'upper'
  const bodySide = affectedSide === 'lower' ? 'upper' : 'lower'
  const body = casting.main[bodySide]
  const use = casting.main[affectedSide]
  return {
    sourceMode: casting.method === 'custom' ? 'direct' : 'calculated',
    sourceLines: casting.calculation,
    trigramMappings: buildMappings(casting),
    main: buildMainDerivation(casting, lines),
    mutual: buildMutualDerivation(casting, lines),
    moving: buildMovingDerivation(casting, lines, affectedSide),
    bodyUse: { bodySide, useSide: affectedSide, body, use, relation: getElementRelation(body.element, use.element).relation },
    checks: buildVerificationChecks(casting),
  }
}
```

The helpers must rebuild mutual and changed hexagrams from line slices and the flipped moving line, then compare names and trigrams against `casting.mutual` and `casting.changed`.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `npm test -- tests/derivation.test.ts`

Expected: all derivation tests pass.

### Task 2: Render one shared derivation component

**Files:**
- Create: `src/components/CastingDerivation.tsx`
- Create: `tests/casting-derivation.test.tsx`

- [ ] **Step 1: Write a failing component test**

```tsx
render(<CastingDerivation casting={castByTime(new Date(2026, 6, 12, 12, 0, 0))} mode="full" />)
expect(screen.getByRole('region', { name: '卦象完整推导链' })).toBeInTheDocument()
expect(screen.getByText('余0按8取数')).toBeInTheDocument()
expect(screen.getByText('1乾 · 2兑 · 3离 · 4震 · 5巽 · 6坎 · 7艮 · 8坤')).toBeInTheDocument()
expect(screen.getByText('下互取第2、3、4爻')).toBeInTheDocument()
expect(screen.getByText('第5爻：阳爻变阴爻')).toBeInTheDocument()
expect(screen.getByText('推导一致')).toBeInTheDocument()
```

- [ ] **Step 2: Run the focused component test and verify RED**

Run: `npm test -- tests/casting-derivation.test.tsx`

Expected: FAIL because `CastingDerivation` does not exist.

- [ ] **Step 3: Implement six semantic sections**

Render a labelled region with these subsections:

```tsx
<section className={`casting-derivation ${mode}`} aria-label="卦象完整推导链">
  <DerivationHeader status={derivation.checks.every((item) => item.verified)} />
  <SourceAndMapping derivation={derivation} />
  <MainComposition derivation={derivation} />
  <MutualExtraction derivation={derivation} />
  <MovingTransformation derivation={derivation} />
  <BodyUseAssignment derivation={derivation} />
  <VerificationList derivation={derivation} />
</section>
```

Use `<ol>`, `<article>`, labelled grids, and the existing `HexagramGlyph` for whole hexagrams. Render the before/after moving line as a focused text-and-line comparison so `HexagramGlyph` remains unchanged.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `npm test -- tests/casting-derivation.test.tsx`

Expected: all shared component tests pass.

### Task 3: Replace duplicate review and result markup

**Files:**
- Modify: `src/features/ReviewStep.tsx`
- Modify: `src/components/AnalysisSections.tsx`
- Modify: `tests/review-step.test.tsx`
- Modify: `tests/app.test.tsx`

- [ ] **Step 1: Extend integration tests before changing pages**

```tsx
expect(screen.getByRole('region', { name: '卦象完整推导链' })).toBeInTheDocument()
expect(screen.getByText('下互取第2、3、4爻')).toBeInTheDocument()
expect(screen.getByText('动爻所在上卦为用，下卦为体')).toBeInTheDocument()
```

Add one assertion in the final reading flow that the derivation details are open by default.

- [ ] **Step 2: Run integration tests and verify RED**

Run: `npm test -- tests/review-step.test.tsx tests/app.test.tsx`

Expected: FAIL because the shared chain is not mounted in both places.

- [ ] **Step 3: Mount the shared component**

In `ReviewStep`, replace `.calculation-box` and its local remainder cards with:

```tsx
<CastingDerivation casting={result} mode="compact" />
```

In `AnalysisSections`, make the final calculation details open by default and render:

```tsx
<details className="reading-section calculation-details" open>
  <summary>查看完整卦象推导链与传统解释边界</summary>
  <CastingDerivation casting={casting} mode="full" />
  <div className="interpretation-boundary">
    <h3>解释边界</h3>
    <p>{analysis.category.focus}</p>
    <p>本卦、互卦、变卦用于观察结构变化，不机械等同于固定日期上的现在、过程和结局。</p>
  </div>
</details>
```

- [ ] **Step 4: Run integration tests and verify GREEN**

Run: `npm test -- tests/review-step.test.tsx tests/app.test.tsx`

Expected: both files pass.

### Task 4: Add responsive Apple styling

**Files:**
- Modify: `src/styles.css`
- Modify: `src/apple-theme.css`

- [ ] **Step 1: Add component class contract to the existing component test**

Assert the region contains `.derivation-step-grid`, `.preheaven-map`, `.line-extraction`, `.transformation-comparison`, and `.derivation-verification`.

- [ ] **Step 2: Run the component test and verify RED**

Run: `npm test -- tests/casting-derivation.test.tsx`

Expected: FAIL until the semantic class contract exists.

- [ ] **Step 3: Add base and Apple theme styles**

Add the concrete layout contract below, then extend it with Apple theme colors, numbered step badges, highlighted trigram numbers, and muted explanation copy:

```css
.casting-derivation { display: grid; gap: 18px; }
.derivation-step-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.derivation-step { min-width: 0; padding: 18px; border: 1px solid var(--line); border-radius: 16px; }
.preheaven-map { display: flex; flex-wrap: wrap; gap: 6px; }
.line-extraction,
.transformation-comparison { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.derivation-verification { display: grid; gap: 8px; }
.derivation-formula { overflow-wrap: anywhere; }
@media (max-width: 820px) {
  .derivation-step-grid,
  .line-extraction,
  .transformation-comparison { grid-template-columns: 1fr; }
}
@media (max-width: 520px) {
  .derivation-step { padding: 14px; }
}
```

- [ ] **Step 4: Run the component test and verify GREEN**

Run: `npm test -- tests/casting-derivation.test.tsx`

Expected: component class contract passes.

### Task 5: Include the derivation in copied reports and protect legacy records

**Files:**
- Modify: `src/domain/report.ts`
- Modify: `src/domain/history.ts`
- Modify: `tests/history.test.ts`
- Modify: `tests/derivation.test.ts`

- [ ] **Step 1: Write failing report and legacy-data tests**

```ts
expect(formatReadingReport(makeRecord())).toContain('卦象推导')
expect(formatReadingReport(makeRecord())).toContain('体卦')
expect(formatReadingReport(makeRecord())).toContain('下互取2、3、4爻')

const legacy = { ...castByTime(date), calculationChecks: undefined } as unknown as CastingResult
expect(buildCastingDerivation(legacy).sourceStatus).toBe('missing-original-source')
```

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- tests/history.test.ts tests/derivation.test.ts`

Expected: FAIL because reports lack derivation and missing checks are not handled.

- [ ] **Step 3: Add summary formatting and fallback handling**

Export `formatDerivationSummary(casting)` from `derivation.ts`, use it in `formatReadingReport`, and make `buildMappings` return an empty mapping with `sourceStatus: 'missing-original-source'` when non-custom historical data lacks `calculationChecks`. Preserve the record instead of discarding it.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `npm test -- tests/history.test.ts tests/derivation.test.ts`

Expected: focused tests pass.

### Task 6: Full verification and browser QA

**Files:**
- Modify only if verification finds a defect.

- [ ] **Step 1: Run the full automated suite**

Run: `npm test`

Expected: all test files and tests pass with zero failures.

- [ ] **Step 2: Run static checks and production build**

Run: `npm run typecheck`

Run: `npm run build -- --base /meihua-research-studio/`

Expected: both exit with code 0.

- [ ] **Step 3: Verify rendered behavior**

Start the local app, complete a time casting, and inspect the review and result pages at desktop width and 390×844. Verify all six stages, the zero-remainder explanation, mutual extraction, moving-line flip, body/use assignment, default-open final details, no console errors, and no horizontal overflow.

- [ ] **Step 4: Commit the implementation**

```bash
git add src tests docs/superpowers/plans/2026-07-12-hexagram-derivation-chain.md
git commit -m "Expand the complete hexagram derivation chain"
```
