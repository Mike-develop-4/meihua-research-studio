import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react'
import type { CastingResult } from '../domain/casting'
import { buildCastingDerivation, type NumberedLine, type TrigramSide } from '../domain/derivation'
import type { Trigram, YinYang } from '../domain/types'
import { HexagramGlyph } from './HexagramGlyph'

interface CastingDerivationProps {
  casting: CastingResult
  mode?: 'compact' | 'full'
}

const SIDE_LABEL: Readonly<Record<TrigramSide, string>> = { upper: '上卦', lower: '下卦' }
const PREHEAVEN_MAP = '1乾 · 2兑 · 3离 · 4震 · 5巽 · 6坎 · 7艮 · 8坤'

function lineText(lines: readonly YinYang[]): string {
  return lines.map((line) => line === 1 ? '阳' : '阴').join(' · ')
}

function TrigramFacts({ trigram }: { trigram: Trigram }) {
  return (
    <dl className="trigram-facts">
      <div><dt>卦象</dt><dd>{trigram.symbol} {trigram.name} · {trigram.nature}</dd></div>
      <div><dt>三爻</dt><dd>{lineText(trigram.lines)}（自下而上）</dd></div>
      <div><dt>五行</dt><dd>{trigram.element}</dd></div>
      <div><dt>方位</dt><dd>{trigram.direction}</dd></div>
      <div><dt>家人</dt><dd>{trigram.family}</dd></div>
      <div><dt>关键词</dt><dd>{trigram.keywords.join('、')}</dd></div>
    </dl>
  )
}

function SixLineLedger({ lines, movingLine }: { lines: readonly NumberedLine[]; movingLine?: number }) {
  return (
    <ol className="six-line-ledger" aria-label="六爻自下而上">
      {[...lines].reverse().map((line) => (
        <li className={movingLine === line.position ? 'moving' : ''} key={line.position}>
          <span>第{line.position}爻</span><i>{line.value === 1 ? '━━━━━━' : '━━　━━'}</i><strong>{line.label} · {line.yinYang}</strong>
        </li>
      ))}
    </ol>
  )
}

function StepHeading({ number, title, subtitle }: { number: string; title: string; subtitle: string }) {
  return (
    <div className="derivation-step-heading">
      <span>{number}</span><div><h4>{title}</h4><p>{subtitle}</p></div>
    </div>
  )
}

export function CastingDerivation({ casting, mode = 'full' }: CastingDerivationProps) {
  const derivation = buildCastingDerivation(casting)
  const beforeLabel = derivation.moving.before === 1 ? '阳' : '阴'
  const afterLabel = derivation.moving.after === 1 ? '阳' : '阴'
  const bodySideLabel = SIDE_LABEL[derivation.bodyUse.bodySide]
  const useSideLabel = SIDE_LABEL[derivation.bodyUse.useSide]

  return (
    <section className={`casting-derivation ${mode}`} aria-label="卦象完整推导链">
      <header className={`derivation-header ${derivation.consistent ? 'verified' : 'invalid'}`}>
        <div><span>可复核计算</span><h3>卦象完整推导链</h3><p>从数源、经卦到本互变与体用，逐步公开每一个转换依据。</p></div>
        <strong>{derivation.consistent ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}{derivation.consistent ? '全部校验通过' : '发现推导异常'}</strong>
      </header>

      <ol className="derivation-track" aria-label="推导阶段">
        {['数源', '取余成卦', '合成本卦', '互卦取爻', '动爻变卦', '体用校验'].map((label, index) => <li key={label}><span>{index + 1}</span>{label}</li>)}
      </ol>

      <div className="derivation-step-grid">
        <article className="derivation-step source-step">
          <StepHeading number="01" title="数源组成" subtitle="先确认每个数从哪里来" />
          {derivation.sourceMode === 'direct' ? (
            <div className="direct-source"><strong>直接指定上下卦与动爻</strong><p>{casting.sourceText}</p><small>自定义排盘不伪造除法、商或余数。</small></div>
          ) : (
            <ol className="source-formulas">{derivation.sourceLines.map((line) => <li key={line}>{line}</li>)}</ol>
          )}
          {derivation.sourceStatus === 'missing-original-source' ? <p className="derivation-warning">旧记录未保存原始除法数源，以下从已保存卦象继续复核。</p> : null}
        </article>

        <article className="derivation-step mapping-step">
          <StepHeading number="02" title="取余与先天八卦" subtitle="上下卦除以8，动爻除以6" />
          <p className="preheaven-map">{PREHEAVEN_MAP}</p>
          {derivation.trigramMappings.length > 0 ? (
            <div className="mapping-cards">
              {derivation.trigramMappings.map((mapping) => (
                <section key={mapping.role}>
                  <span>{SIDE_LABEL[mapping.role]}</span>
                  <strong className="derivation-formula">{mapping.source} ÷ 8 ＝ {mapping.quotient} 余 {mapping.rawRemainder}</strong>
                  <em>{mapping.rawRemainder === 0 ? '余0按8取数' : `余${mapping.rawRemainder}直接取数`}</em>
                  <b>取数{mapping.normalizedValue} → {mapping.trigram.symbol} {mapping.trigram.name}卦</b>
                  <TrigramFacts trigram={mapping.trigram} />
                </section>
              ))}
            </div>
          ) : <p className="mapping-note">本卦经卦数为上{casting.upperNumber}、下{casting.lowerNumber}；当前路径无需重复取余。</p>}
        </article>

        <article className="derivation-step main-step">
          <StepHeading number="03" title="上下卦合成本卦" subtitle="六爻从下向上编号" />
          <div className="hexagram-composition">
            <HexagramGlyph hexagram={casting.main} movingLine={casting.movingLine} />
            <div>
              <strong>{derivation.main.upper.symbol} {derivation.main.upper.name}在上 ＋ {derivation.main.lower.symbol} {derivation.main.lower.name}在下</strong>
              <h5>合为《{derivation.main.name}》</h5>
              <p>下卦占第1–3爻，表示内部、基础或起始条件；上卦占第4–6爻，表示外部、上层或显现条件。具体所指仍须结合问事语境。</p>
            </div>
          </div>
          <SixLineLedger lines={derivation.main.lines} movingLine={casting.movingLine} />
        </article>

        <article className="derivation-step mutual-step">
          <StepHeading number="04" title="互卦取爻" subtitle="从本卦中间四爻观察内部结构" />
          <div className="line-extraction">
            <section><span>下互取第2、3、4爻</span><strong>{lineText(derivation.mutual.lowerLines)}</strong><b>→ {derivation.mutual.lower.symbol} {derivation.mutual.lower.name}卦</b></section>
            <section><span>上互取第3、4、5爻</span><strong>{lineText(derivation.mutual.upperLines)}</strong><b>→ {derivation.mutual.upper.symbol} {derivation.mutual.upper.name}卦</b></section>
          </div>
          <div className="derived-result"><strong>{derivation.mutual.upper.name}上、{derivation.mutual.lower.name}下，合为《{derivation.mutual.name}》</strong><p>互卦用于观察结构内部的牵引与演化机制，不机械等同于固定日期上的“过程”。</p></div>
        </article>

        <article className="derivation-step change-step">
          <StepHeading number="05" title="动爻翻转与变卦" subtitle="只翻转被取中的一爻" />
          {derivation.moving.arithmetic ? (
            <div className="moving-arithmetic">
              <strong>{derivation.moving.arithmetic.source} ÷ 6 ＝ {derivation.moving.arithmetic.quotient} 余 {derivation.moving.arithmetic.rawRemainder}</strong>
              <span>{derivation.moving.arithmetic.rawRemainder === 0 ? '余0按第6爻处理' : `余${derivation.moving.arithmetic.rawRemainder}取第${derivation.moving.position}爻`}</span>
            </div>
          ) : null}
          <p className="moving-statement">第{derivation.moving.position}爻：{beforeLabel}爻变{afterLabel}爻</p>
          <div className="transformation-comparison">
            <section><span>变化前 · {useSideLabel}</span><strong>{derivation.moving.originalTrigram.symbol} {derivation.moving.originalTrigram.name}</strong><p>{lineText(derivation.moving.originalTrigram.lines)}</p></section>
            <ArrowRight size={19} />
            <section><span>变化后 · {useSideLabel}</span><strong>{derivation.moving.changedTrigram.symbol} {derivation.moving.changedTrigram.name}</strong><p>{lineText(derivation.moving.changedTrigram.lines)}</p></section>
          </div>
          <div className="changed-hexagram"><HexagramGlyph hexagram={derivation.moving.changedHexagram} /><div><span>另一经卦保持不变</span><strong>得到变卦《{derivation.moving.changedHexagram.name}》</strong></div></div>
        </article>

        <article className="derivation-step body-use-step">
          <StepHeading number="06" title="体用定位与校验" subtitle="动者为用，静者为体" />
          <p className="body-use-rule">动爻所在{useSideLabel}为用，{bodySideLabel}为体</p>
          <div className="body-use-cards">
            <section><span>体卦 · {bodySideLabel}</span><strong>{derivation.bodyUse.body.symbol} {derivation.bodyUse.body.name} · {derivation.bodyUse.body.element}</strong></section>
            <section><span>用卦 · {useSideLabel}</span><strong>{derivation.bodyUse.use.symbol} {derivation.bodyUse.use.name} · {derivation.bodyUse.use.element}</strong></section>
          </div>
          <div className="relation-result"><strong>{derivation.bodyUse.relation}</strong><p>{derivation.bodyUse.description}</p><small>此处只确认结构关系；严重程度仍需结合月令旺衰与事项语境。</small></div>
        </article>
      </div>

      <div className={`derivation-verification ${derivation.consistent ? 'verified' : 'invalid'}`}>
        <div><h4>{derivation.consistent ? '推导一致' : '推导存在异常'}</h4><p>逐项重建后与当前保存结果比对。</p></div>
        <ul>{derivation.checks.map((check) => <li key={check.key}>{check.verified ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}<span><strong>{check.label}</strong><small>{check.detail}</small></span></li>)}</ul>
      </div>
    </section>
  )
}
