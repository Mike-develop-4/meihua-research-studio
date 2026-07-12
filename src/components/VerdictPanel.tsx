import { Gauge, ShieldCheck } from 'lucide-react'
import type { ReadingAnalysis } from '../domain/analysis'
import type { QuestionContext } from '../domain/types'

interface VerdictPanelProps {
  analysis: ReadingAnalysis
  context: QuestionContext
}

export function VerdictPanel({ analysis, context }: VerdictPanelProps) {
  return (
    <section className={`verdict-panel ${analysis.summary.tone}`} aria-labelledby="verdict-title">
      <div className="verdict-copy">
        <p className="question-echo">{context.question}</p>
        <h2 id="verdict-title">{analysis.summary.headline}</h2>
        <p>{analysis.summary.narrative}</p>
        <div className="verdict-context"><span>{analysis.category.label}</span><i /> <span>体：{analysis.category.bodyRole}</span><i /> <span>用：{analysis.category.useRole}</span></div>
      </div>
      <div className="score-dial" aria-label={`趋势整理分${analysis.score}分`}>
        <Gauge size={18} />
        <strong>{analysis.score}</strong><small>/ 100</small>
        <span>趋势整理分</span>
      </div>
      <div className="score-note"><ShieldCheck size={15} /><span>{analysis.scoreNote}</span></div>
    </section>
  )
}
