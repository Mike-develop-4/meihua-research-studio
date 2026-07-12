import { CATEGORY_GUIDANCE } from '../data/category-guidance'
import type { CastingResult } from './casting'
import { getHexagramTheme } from './hexagrams'
import { getElementRelation, getMonthElement, getSeasonalStrength, generates, STRENGTH_RANK, type ElementRelationName, type SeasonalStrength } from './elements'
import type { ActivityState, Element, Hexagram, QuestionContext, Trigram } from './types'

export { getElementRelation, getMonthElement, getSeasonalStrength }

type BodySide = 'upper' | 'lower'
type EvidenceKind = 'support' | 'pressure' | 'neutral'
type Severity = 'supportive' | 'balanced' | 'manageable' | 'elevated'

export interface BodyUse {
  body: Trigram
  use: Trigram
  bodySide: BodySide
}

export interface PhaseInfluence {
  role: '用卦' | '上互' | '下互' | '变卦'
  trigram: Trigram
  relation: ElementRelationName
  relationDescription: string
  strength: SeasonalStrength
  severity: Severity
}

export interface PhaseAnalysis extends BodyUse {
  key: 'main' | 'mutual' | 'changed'
  label: string
  framing: string
  hexagram: Hexagram
  theme: string
  relation: ElementRelationName
  relationLabel: string
  relationDescription: string
  bodyStrength: SeasonalStrength
  useStrength: SeasonalStrength
  influences: readonly PhaseInfluence[]
  severity: Severity
  adjustedDelta: number
}

export interface EvidenceItem {
  id: string
  kind: EvidenceKind
  title: string
  detail: string
  weight: number
}

export interface ReadingAnalysis {
  summary: { headline: string; narrative: string; tone: 'favorable' | 'mixed' | 'caution' }
  score: number
  scoreNote: string
  phases: readonly PhaseAnalysis[]
  evidence: readonly EvidenceItem[]
  contradiction: { title: string; detail: string }
  movingLine: { position: number; label: string; meaning: string }
  category: { label: string; focus: string; bodyRole: string; useRole: string }
  actions: { now: readonly string[]; prevent: readonly string[]; observe: readonly string[] }
  season: {
    monthBranch: string
    monthElement: Element
    body: { trigram: Trigram; strength: SeasonalStrength }
    influences: readonly { role: '本卦用卦' | '上互' | '下互' | '变卦'; trigram: Trigram; strength: SeasonalStrength }[]
    explanation: string
  }
  timing: {
    label: string
    basis: string
    disclaimer: string
    activityState: ActivityState
    activityLabel: string
    pace: 'fastest' | 'faster' | 'baseline' | 'slower' | 'slowest' | 'uncertain'
  }
  party: { bodySupport: number; useSupport: number; explanation: string }
}

const ACTIVITY_TIMING: Readonly<Record<ActivityState, {
  label: string
  pace: ReadingAnalysis['timing']['pace']
  rule: string
  reading: string
}>> = {
  sitting: { label: '坐着静止', pace: 'slower', rule: '坐则事应迟', reading: '相对基准偏迟' },
  standing: { label: '站立静止', pace: 'baseline', rule: '立取常速', reading: '按常速观察' },
  walking: { label: '行走中', pace: 'faster', rule: '行则事应速', reading: '相对基准偏快' },
  running: { label: '快走或跑动中', pace: 'fastest', rule: '走则愈速', reading: '应象节奏最快' },
  lying: { label: '躺卧静止', pace: 'slowest', rule: '卧则愈迟', reading: '应象节奏最慢' },
  uncertain: { label: '不确定', pace: 'uncertain', rule: '动静未记录', reading: '不作快慢校正' },
}

const PHASE_META = [
  { key: 'main', label: '基础格局', framing: '事情当前显露的结构与起点', weight: 1 },
  { key: 'mutual', label: '内部动力', framing: '中间隐藏的机制、协作与内在变化', weight: 0.8 },
  { key: 'changed', label: '后续状态', framing: '当前动因继续发展后较可能进入的新状态', weight: 1.1 },
] as const

const MOVING_LINE_MEANINGS = [
  { label: '基础启动', meaning: '变化发生在底层条件，先检查资源、规则与最初假设。' },
  { label: '执行承接', meaning: '变化落在具体执行与协作位置，过程质量比口号更重要。' },
  { label: '内外关口', meaning: '事情正接近阶段边界，旧方法需要在跨越前完成校准。' },
  { label: '外部介入', meaning: '外部关系、合作方或环境开始影响内部节奏。' },
  { label: '核心决策', meaning: '关键变化位于决策权、负责人或核心成果层面。' },
  { label: '周期转换', meaning: '事情接近当前周期的极点，宜考虑收束、退出或转型。' },
] as const

export function getBodyUse(hexagram: Hexagram, movingLine: number): BodyUse {
  const bodySide: BodySide = movingLine <= 3 ? 'upper' : 'lower'
  return bodySide === 'upper'
    ? { body: hexagram.upper, use: hexagram.lower, bodySide }
    : { body: hexagram.lower, use: hexagram.upper, bodySide }
}

function phaseSeverity(relation: ElementRelationName, bodyStrength: SeasonalStrength, useStrength: SeasonalStrength): Severity {
  const difference = STRENGTH_RANK[bodyStrength] - STRENGTH_RANK[useStrength]
  const isPressure = relation === '用克体' || relation === '体生用'
  if (isPressure && difference > 0) return 'manageable'
  if (isPressure && difference < 0) return 'elevated'
  if (relation === '用生体' || relation === '体克用' || relation === '比和') return difference < -1 ? 'balanced' : 'supportive'
  return 'balanced'
}

function analyzePhase(
  key: PhaseAnalysis['key'],
  casting: CastingResult,
  monthBranch: string,
  fixedBodyUse: BodyUse,
): PhaseAnalysis {
  const meta = PHASE_META.find((item) => item.key === key)!
  const hexagram = casting[key]
  const bodyStrength = getSeasonalStrength(fixedBodyUse.body.element, monthBranch)
  const targets: { role: PhaseInfluence['role']; trigram: Trigram }[] = key === 'mutual'
    ? [{ role: '上互', trigram: hexagram.upper }, { role: '下互', trigram: hexagram.lower }]
    : [{
        role: key === 'main' ? '用卦' : '变卦',
        trigram: fixedBodyUse.bodySide === 'upper' ? hexagram.lower : hexagram.upper,
      }]
  const influenceDeltas: number[] = []
  const influences = targets.map(({ role, trigram }) => {
    const relation = getElementRelation(fixedBodyUse.body.element, trigram.element)
    const strength = getSeasonalStrength(trigram.element, monthBranch)
    influenceDeltas.push(relation.delta + (STRENGTH_RANK[bodyStrength] - STRENGTH_RANK[strength]) * 4)
    return {
      role,
      trigram,
      relation: relation.relation,
      relationDescription: relation.description,
      strength,
      severity: phaseSeverity(relation.relation, bodyStrength, strength),
    }
  })
  const severity: Severity = influences.some((item) => item.severity === 'elevated')
    ? 'elevated'
    : influences.some((item) => item.severity === 'manageable')
      ? 'manageable'
      : influences.every((item) => item.severity === 'supportive')
        ? 'supportive'
        : 'balanced'
  const relationLabel = [...new Set(influences.map((item) => item.relation))].join('＋')
  const averageDelta = influenceDeltas.reduce((sum, delta) => sum + delta, 0) / influenceDeltas.length
  const primary = influences[0]
  return {
    key, label: meta.label, framing: meta.framing, hexagram,
    body: fixedBodyUse.body, use: primary.trigram, bodySide: fixedBodyUse.bodySide,
    theme: getHexagramTheme(hexagram), relation: primary.relation, relationLabel,
    relationDescription: influences.map((item) => `${item.role}${item.trigram.name}${item.relation}`).join('；'),
    bodyStrength, useStrength: primary.strength, influences, severity,
    adjustedDelta: Math.round(averageDelta * meta.weight),
  }
}

function evidenceKind(delta: number): EvidenceKind {
  if (delta >= 5) return 'support'
  if (delta <= -5) return 'pressure'
  return 'neutral'
}

function buildEvidence(phases: readonly PhaseAnalysis[], party: ReadingAnalysis['party']): EvidenceItem[] {
  const phaseEvidence = phases.map((phase) => ({
    id: phase.key,
    kind: evidenceKind(phase.adjustedDelta),
    title: `${phase.label} · ${phase.relationLabel}`,
    detail: `${phase.hexagram.name}中，固定体卦为${phase.body.name}${phase.body.element}${phase.bodyStrength}；${phase.influences.map((item) => `${item.role}${item.trigram.name}${item.trigram.element}${item.strength}，对体为${item.relation}`).join('；')}。`,
    weight: Math.abs(phase.adjustedDelta),
  }))
  const partyDelta = (party.bodySupport - party.useSupport) * 3
  return [...phaseEvidence, {
    id: 'party', kind: evidenceKind(partyDelta), title: '体党与用党', detail: party.explanation, weight: Math.abs(partyDelta),
  }]
}

function supports(element: Element, target: Element): boolean {
  return element === target || generates(element, target)
}

function calculateParty(phases: readonly PhaseAnalysis[]): ReadingAnalysis['party'] {
  const bodyElement = phases[0].body.element
  const useElement = phases[0].use.element
  const trigrams = phases.flatMap((phase) => [phase.hexagram.upper, phase.hexagram.lower])
  const bodySupport = trigrams.filter((trigram) => supports(trigram.element, bodyElement)).length
  const useSupport = trigrams.filter((trigram) => supports(trigram.element, useElement)).length
  return {
    bodySupport, useSupport,
    explanation: bodySupport === useSupport
      ? `支持主体与支持外部事项的力量均为${bodySupport}项，整体需要靠执行质量分出高下。`
      : bodySupport > useSupport
        ? `支持主体的力量有${bodySupport}项，高于用方的${useSupport}项，主体承压后仍有调整空间。`
        : `支持用方的力量有${useSupport}项，高于主体的${bodySupport}项，外部条件更强，宜预留缓冲。`,
  }
}

function buildContradiction(phases: readonly PhaseAnalysis[]): ReadingAnalysis['contradiction'] {
  const first = phases[0]
  const last = phases[2]
  const firstPositive = first.adjustedDelta > 0
  const lastNegative = last.adjustedDelta < 0
  if (firstPositive && lastNegative) {
    return {
      title: '前期得势，后期受制',
      detail: `本卦的${first.relation}说明当前条件相对有利，但变卦的${last.relation}提示规模、规则或外部关系会在后续形成压力。这不是“前吉后必败”，而是在提醒前期优势必须转化为后期承载能力。`,
    }
  }
  if (!firstPositive && last.adjustedDelta > 0) {
    return {
      title: '先处理结构，再等待转机',
      detail: `基础格局暂有阻力，而后续状态的${last.relation}出现改善。转机依赖前期是否真正处理资源、边界和执行问题，不宜只等待环境自动变化。`,
    }
  }
  return {
    title: '信息方向基本一致',
    detail: `本卦与变卦的力量方向没有形成强烈反转；互卦提示的内部动力是决定趋势能否延续的关键。仍需用现实反馈持续校验，不把单一卦象当作固定结局。`,
  }
}

function summaryFor(phases: readonly PhaseAnalysis[], score: number): ReadingAnalysis['summary'] {
  const elevated = phases.some((phase) => phase.severity === 'elevated')
  const manageable = phases.some((phase) => phase.severity === 'manageable')
  const tone: ReadingAnalysis['summary']['tone'] = elevated || score < 40 ? 'caution' : score >= 62 ? 'favorable' : 'mixed'
  const headline = elevated
    ? '外部压力偏强，先稳住主体再谋推进'
    : manageable
      ? '存在现实压力，但主体仍有化解空间'
      : score >= 62
        ? '条件总体可用，关键在把优势转成持续能力'
        : '机会与约束并存，宜边验证边调整'
  const narrative = elevated
    ? '用方力量强于主体，后续容易出现资源、规则或关系上的牵制；主体承受能力不足时风险会被放大。结论是提高防守与承载能力，并持续用现实反馈调整。'
    : manageable
      ? '虽然出现克制或消耗信号，但体方更旺、用方偏弱，说明压力真实存在却仍在主体可承受和调整的范围内。'
      : '卦象没有给出单向答案；有利条件需要通过明确边界、稳定执行和现实反馈才能保留下来。'
  return { headline, narrative, tone }
}

function buildSeason(monthBranch: string, phases: readonly PhaseAnalysis[]): ReadingAnalysis['season'] {
  const monthElement = getMonthElement(monthBranch)
  const body = { trigram: phases[0].body, strength: phases[0].bodyStrength }
  const influences = phases.flatMap((phase) => phase.influences.map((influence) => ({
    role: (phase.key === 'main' ? '本卦用卦' : influence.role) as ReadingAnalysis['season']['influences'][number]['role'],
    trigram: influence.trigram,
    strength: influence.strength,
  })))
  return {
    monthBranch,
    monthElement,
    body,
    influences,
    explanation: `${monthBranch}月月令五行为${monthElement}；体卦${body.trigram.name}属${body.trigram.element}，在当令为${body.strength}。旺衰已进入各阶段压力等级与趋势分值，不是只作旁注。`,
  }
}

function timingFor(casting: CastingResult, context: QuestionContext, season: ReadingAnalysis['season']): ReadingAnalysis['timing'] {
  const period = Math.max(1, Math.min(12, casting.changed.upper.number + casting.changed.lower.number))
  const activityState = context.activityState ?? 'uncertain'
  const activity = ACTIVITY_TIMING[activityState]
  return {
    label: `以约${period}个事项时间单位为观察基数 · ${activity.reading}`,
    basis: `参考动爻${casting.movingLine}、变卦上下卦数${casting.changed.upper.number}与${casting.changed.lower.number}取基数；起卦时状态为${activity.label}，依“${activity.rule}”校正快慢。当前${season.monthBranch}月（${season.monthElement}令），体卦${season.body.strength}，作为当下承载力背景。`,
    disclaimer: '应期属于传统象数的快慢与窗口参考；时间单位应按事项自然周期理解，不等同于精确日期。',
    activityState,
    activityLabel: activity.label,
    pace: activity.pace,
  }
}

export function analyzeReading(casting: CastingResult, context: QuestionContext): ReadingAnalysis {
  const monthBranch = casting.lunarInfo.monthBranch
  const fixedBodyUse = getBodyUse(casting.main, casting.movingLine)
  const phases = PHASE_META.map((phase) => analyzePhase(phase.key, casting, monthBranch, fixedBodyUse))
  const season = buildSeason(monthBranch, phases)
  const party = calculateParty(phases)
  const rawScore = 50 + phases.reduce((sum, phase) => sum + phase.adjustedDelta, 0) + (party.bodySupport - party.useSupport) * 2
  const score = Math.max(8, Math.min(92, Math.round(rawScore)))
  const guidance = CATEGORY_GUIDANCE[context.category]
  const summary = summaryFor(phases, score)
  const moving = MOVING_LINE_MEANINGS[casting.movingLine - 1]
  const relationAction = phases[2].severity === 'elevated'
    ? ['缩小一次性承诺，把不可逆投入改成分阶段投入']
    : phases[2].severity === 'manageable'
      ? ['把后期压力提前写进预算、合同和时间表']
      : ['保持当前有效做法，同时设置可量化的复盘节点']
  return {
    summary, score,
    scoreNote: '趋势分值只用于整理相互矛盾的传统象数信息，不代表客观概率，也不构成现实决策依据。',
    phases,
    evidence: buildEvidence(phases, party),
    contradiction: buildContradiction(phases),
    movingLine: { position: casting.movingLine, ...moving },
    category: { label: context.categoryLabel?.trim() || guidance.label, focus: guidance.focus, bodyRole: guidance.bodyRole, useRole: guidance.useRole },
    actions: {
      now: [...guidance.now],
      prevent: [...guidance.prevent, ...relationAction],
      observe: [...guidance.observe],
    },
    season,
    timing: timingFor(casting, context, season),
    party,
  }
}
