import { ArrowRight, CheckCircle2 } from 'lucide-react'
import type { CastingResult } from '../domain/casting'

interface ReviewStepProps {
  result: CastingResult
  onBack: () => void
  onGenerate: () => void
}

export function ReviewStep({ result, onBack, onGenerate }: ReviewStepProps) {
  const checkLabels = { upper: '上卦', lower: '下卦', moving: '动爻' } as const
  return (
    <section className="step-panel review-step" aria-labelledby="review-title">
      <div className="section-heading">
        <span>03</span>
        <div><h2 id="review-title">校验数源与卦象</h2><p>先确认算法口径，再进入解卦；这是结果可复核的基础。</p></div>
      </div>
      <div className="review-context"><CheckCircle2 size={18} /><span>{result.methodLabel}</span><strong>{result.sourceText}</strong></div>
      <div className="review-journey" aria-label="本互变卦预览">
        {[['本卦', result.main], ['互卦', result.mutual], ['变卦', result.changed]].map(([label, hexagram], index) => (
          <div key={label as string} className="review-hex">
            <small>{label as string}</small><strong>{(hexagram as CastingResult['main']).name}</strong><span>{(hexagram as CastingResult['main']).upper.symbol} {(hexagram as CastingResult['main']).lower.symbol}</span>
            {index < 2 ? <ArrowRight className="review-arrow" size={18} /> : null}
          </div>
        ))}
      </div>
      <div className="calculation-box">
        <h3>计算过程</h3>
        <ol>{result.calculation.map((line) => <li key={line}>{line}</li>)}</ol>
        {result.method !== 'custom' ? (
          <div className="calculation-check-grid" aria-label="余数与先天八卦校验">
            {result.calculationChecks.map((check) => (
              <article className={`calculation-check ${check.verified ? 'verified' : 'invalid'}`} key={check.role}>
                <div className="calculation-check-heading">
                  <strong>{checkLabels[check.role]}</strong>
                  <span><CheckCircle2 size={14} />{check.verified ? '已校验' : '校验异常'}</span>
                </div>
                <p>{check.source} ÷ {check.divisor} ＝ {check.quotient} 余 {check.rawRemainder}</p>
                <small>{check.rawRemainder === 0 ? `余0按${check.divisor}取数` : `余${check.rawRemainder}直接取数`}</small>
                <b>{check.role === 'moving'
                  ? `取第${check.normalizedValue}爻`
                  : `${check.normalizedValue} → ${check.trigram?.name}卦（${check.trigram?.symbol}，${check.trigram?.nature}）`}</b>
              </article>
            ))}
          </div>
        ) : null}
        <p>动爻在{result.movingLine <= 3 ? '下卦，因此上卦为体、下卦为用' : '上卦，因此下卦为体、上卦为用'}。</p>
      </div>
      <div className="step-actions"><button type="button" className="button ghost" onClick={onBack}>返回修改</button><button type="button" className="button primary" onClick={onGenerate}>生成完整解读</button></div>
    </section>
  )
}
