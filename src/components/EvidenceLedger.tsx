import { AlertTriangle, CircleDot, ThumbsUp } from 'lucide-react'
import type { ReadingAnalysis } from '../domain/analysis'

const icons = { support: ThumbsUp, pressure: AlertTriangle, neutral: CircleDot }
const labels = { support: '支持', pressure: '压力', neutral: '中性' }

export function EvidenceLedger({ analysis }: { analysis: ReadingAnalysis }) {
  return (
    <aside className="evidence-ledger" aria-labelledby="evidence-title">
      <div className="ledger-heading"><h2 id="evidence-title">证据链</h2><span>可展开复核</span></div>
      <div className="evidence-list">
        {analysis.evidence.map((item) => {
          const Icon = icons[item.kind]
          return (
            <details key={item.id} className={item.kind} open={item.id === 'changed'}>
              <summary><span className="evidence-icon"><Icon size={15} /></span><span><small>{labels[item.kind]} · 权重 {item.weight}</small><strong>{item.title}</strong></span></summary>
              <p>{item.detail}</p>
            </details>
          )
        })}
      </div>
      <div className="party-summary"><strong>体党 {analysis.party.bodySupport} / 用党 {analysis.party.useSupport}</strong><p>{analysis.party.explanation}</p></div>
    </aside>
  )
}
