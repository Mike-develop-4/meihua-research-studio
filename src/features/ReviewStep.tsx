import { ArrowRight, CheckCircle2 } from 'lucide-react'
import type { CastingResult } from '../domain/casting'

interface ReviewStepProps {
  result: CastingResult
  onBack: () => void
  onGenerate: () => void
}

export function ReviewStep({ result, onBack, onGenerate }: ReviewStepProps) {
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
        <p>动爻在{result.movingLine <= 3 ? '下卦，因此上卦为体、下卦为用' : '上卦，因此下卦为体、上卦为用'}。</p>
      </div>
      <div className="step-actions"><button type="button" className="button ghost" onClick={onBack}>返回修改</button><button type="button" className="button primary" onClick={onGenerate}>生成完整解读</button></div>
    </section>
  )
}
