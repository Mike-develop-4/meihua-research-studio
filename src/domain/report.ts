import type { ReadingRecord } from './history'
import { formatDerivationSummary } from './derivation'

function list(items: readonly string[]): string {
  return items.map((item, index) => `${index + 1}. ${item}`).join('\n')
}

export function formatReadingReport(record: ReadingRecord): string {
  const { context, casting, analysis } = record
  const phaseLines = analysis.phases.map((phase) => (
    `- ${phase.label}：${phase.hexagram.name}｜固定体${phase.body.name}${phase.body.element}${phase.bodyStrength}｜${phase.influences.map((item) => `${item.role}${item.trigram.name}${item.trigram.element}${item.strength}（${item.relation}）`).join('；')}`
  )).join('\n')
  const evidenceLines = analysis.evidence.map((item) => `- [${item.kind === 'support' ? '支持' : item.kind === 'pressure' ? '压力' : '中性'}] ${item.title}：${item.detail}`).join('\n')
  return [
    '观象 · 梅花易数研究报告',
    `问题：${context.question}`,
    `事项：${analysis.category.label}｜主体：${context.subject || '求测者'}｜起卦：${casting.methodLabel}`,
    `卦象：本卦${casting.main.name} → 互卦${casting.mutual.name} → 变卦${casting.changed.name}，动${casting.movingLine}爻`,
    `月令：${analysis.season.monthBranch}月｜月令五行${analysis.season.monthElement}｜体卦${analysis.season.body.trigram.name}${analysis.season.body.trigram.element}${analysis.season.body.strength}`,
    `应期：起卦时状态${analysis.timing.activityLabel}｜${analysis.timing.label}`,
    '',
    formatDerivationSummary(casting),
    '',
    '综合判断',
    `${analysis.summary.headline}。${analysis.summary.narrative}`,
    `趋势整理分：${analysis.score}/100（${analysis.scoreNote}）`,
    '',
    '三层推演',
    phaseLines,
    '',
    '证据链',
    evidenceLines,
    '',
    '矛盾化解',
    `${analysis.contradiction.title}：${analysis.contradiction.detail}`,
    '',
    '应期依据',
    `${analysis.timing.basis} ${analysis.timing.disclaimer}`,
    '',
    '行动建议｜现在做',
    list(analysis.actions.now),
    '',
    '行动建议｜提前防',
    list(analysis.actions.prevent),
    '',
    '行动建议｜继续观察',
    list(analysis.actions.observe),
    '',
    '说明：本报告属于传统文化解释与情景反思工具，不构成医疗、投资、法律或其他专业建议。',
  ].join('\n')
}
