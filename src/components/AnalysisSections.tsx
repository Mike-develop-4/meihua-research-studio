import { AlertCircle, Clock3, Eye, Footprints, Layers3, Orbit, ShieldAlert } from 'lucide-react'
import type { ReadingAnalysis } from '../domain/analysis'
import type { CastingResult } from '../domain/casting'
import { CastingDerivation } from './CastingDerivation'

export function AnalysisSections({ analysis, casting }: { analysis: ReadingAnalysis; casting: CastingResult }) {
  return (
    <div className="analysis-flow">
      <section className="reading-section contradiction-section">
        <div className="section-icon"><Layers3 size={20} /></div>
        <div><h2>{analysis.contradiction.title}</h2><p>{analysis.contradiction.detail}</p></div>
      </section>

      <section className="reading-section moving-section">
        <div className="reading-section-heading"><div><h2>动爻转折</h2><p>第{casting.movingLine}爻 · {analysis.movingLine.label}</p></div><span>{casting.main.lower.name}{casting.movingLine <= 3 ? '卦内部' : `至${casting.main.upper.name}卦层面`}</span></div>
        <p className="large-reading">{analysis.movingLine.meaning}</p>
      </section>

      <section className="reading-section season-section" aria-labelledby="season-title">
        <div className="reading-section-heading">
          <div><h2 id="season-title">月令与旺衰</h2><p>{analysis.season.monthBranch}月 · 月令五行{analysis.season.monthElement}</p></div>
          <Orbit size={22} />
        </div>
        <p className="season-explanation">{analysis.season.explanation}</p>
        <div className="season-ledger">
          <div className="season-item body"><span>固定体卦</span><strong>{analysis.season.body.trigram.name} · {analysis.season.body.trigram.element}</strong><em>{analysis.season.body.strength}</em></div>
          {analysis.season.influences.map((item) => (
            <div className="season-item" key={`${item.role}-${item.trigram.name}`}><span>{item.role}</span><strong>{item.trigram.name} · {item.trigram.element}</strong><em>{item.strength}</em></div>
          ))}
        </div>
      </section>

      <section className="reading-section action-section" aria-labelledby="action-title">
        <div className="reading-section-heading"><div><h2 id="action-title">行动建议</h2><p>把卦象转化为可验证、可调整的现实动作。</p></div></div>
        <div className="action-columns">
          <div><Footprints size={18} /><h3>现在做</h3><ul>{analysis.actions.now.map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div><ShieldAlert size={18} /><h3>提前防</h3><ul>{analysis.actions.prevent.map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div><Eye size={18} /><h3>继续观察</h3><ul>{analysis.actions.observe.map((item) => <li key={item}>{item}</li>)}</ul></div>
        </div>
      </section>

      <section className="reading-section timing-section">
        <Clock3 size={20} />
        <div><h2>应期参考</h2><span className="timing-state">起卦时状态：{analysis.timing.activityLabel}</span><strong>{analysis.timing.label}</strong><p>{analysis.timing.basis}</p><small>{analysis.timing.disclaimer}</small></div>
      </section>

      <details className="reading-section calculation-details" open>
        <summary>查看完整卦象推导链与传统解释边界</summary>
        <div className="calculation-detail-grid">
          <CastingDerivation casting={casting} mode="full" />
          <div className="interpretation-boundary"><h3>解释边界</h3><p>{analysis.category.focus}</p><p>本卦、互卦、变卦用于观察结构变化；它们可以映射为起点、内因和后续状态，但不应被机械地等同于固定日期上的“现在、过程、结局”。</p></div>
        </div>
      </details>

      <div className="culture-disclaimer"><AlertCircle size={17} /><div><strong>传统文化解释与情景反思工具</strong><p>结果不构成医疗、投资、法律或其他专业建议。重要决定请结合现实数据与专业意见。</p></div></div>
    </div>
  )
}
