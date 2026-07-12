import { ArrowRight } from 'lucide-react'
import type { ReadingAnalysis } from '../domain/analysis'
import type { CastingResult } from '../domain/casting'
import { HexagramGlyph } from './HexagramGlyph'

interface HexagramJourneyProps {
  casting: CastingResult
  analysis: ReadingAnalysis
}

export function HexagramJourney({ casting, analysis }: HexagramJourneyProps) {
  return (
    <section className="reading-section journey-section" aria-labelledby="journey-title">
      <div className="reading-section-heading"><div><h2 id="journey-title">卦势轨迹</h2><p>基础、内因与后续状态是一条连续证据链，不是机械的命运时间表。</p></div><span>动{casting.movingLine}爻 · {analysis.movingLine.label}</span></div>
      <div className="journey-line">
        {analysis.phases.map((phase, index) => (
          <article key={phase.key} className={`journey-phase ${phase.severity}`}>
            <div className="phase-top"><span>{phase.label}</span><small>{phase.framing}</small></div>
            <div className="phase-core">
              <HexagramGlyph hexagram={phase.hexagram} movingLine={phase.key === 'main' ? casting.movingLine : undefined} />
              <div><strong>{phase.hexagram.name}</strong><p>{phase.theme}</p></div>
            </div>
            <div className={`phase-relation${phase.influences.length > 1 ? ' multi' : ''}`}>
              <span>{phase.influences.length > 1 ? '固定体' : '体'} {phase.body.name} · {phase.body.element} · {phase.bodyStrength}</span>
              {phase.influences.length === 1 ? (
                <><b>{phase.relationLabel}</b><span>{phase.influences[0].role} {phase.influences[0].trigram.name} · {phase.influences[0].trigram.element} · {phase.influences[0].strength}</span></>
              ) : (
                <div className="phase-influence-list">
                  {phase.influences.map((influence) => (
                    <span key={influence.role}><i>{influence.role}</i>{influence.trigram.name} · {influence.trigram.element} · {influence.strength}<b>{influence.relation}</b></span>
                  ))}
                </div>
              )}
            </div>
            {index < 2 ? <ArrowRight className="journey-arrow" size={20} /> : null}
          </article>
        ))}
      </div>
    </section>
  )
}
