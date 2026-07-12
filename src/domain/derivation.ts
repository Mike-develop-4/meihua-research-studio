import type { CalculationCheck, CastingResult } from './casting'
import { getElementRelation, type ElementRelationName } from './elements'
import { buildHexagram, normalizedRemainder, trigramByLines, trigramByNumber } from './hexagrams'
import type { Hexagram, Trigram, YinYang } from './types'

export type TrigramSide = 'upper' | 'lower'
export type DerivationSourceMode = 'calculated' | 'direct'
export type DerivationSourceStatus = 'complete' | 'missing-original-source'

export interface NumberedLine {
  readonly position: number
  readonly value: YinYang
  readonly yinYang: '阳' | '阴'
  readonly label: string
}
export interface TrigramMapping {
  readonly role: TrigramSide
  readonly source: number
  readonly divisor: 8
  readonly quotient: number
  readonly rawRemainder: number
  readonly normalizedValue: number
  readonly trigram: Trigram
  readonly verified: boolean
}

export interface MainDerivation {
  readonly name: string
  readonly upper: Trigram
  readonly lower: Trigram
  readonly lines: readonly NumberedLine[]
  readonly lowerPositions: readonly [1, 2, 3]
  readonly upperPositions: readonly [4, 5, 6]
}

export interface MutualDerivation {
  readonly name: string
  readonly upper: Trigram
  readonly lower: Trigram
  readonly upperPositions: readonly [3, 4, 5]
  readonly lowerPositions: readonly [2, 3, 4]
  readonly upperLines: readonly YinYang[]
  readonly lowerLines: readonly YinYang[]
}

export interface MovingDerivation {
  readonly position: number
  readonly label: string
  readonly affectedSide: TrigramSide
  readonly before: YinYang
  readonly after: YinYang
  readonly originalTrigram: Trigram
  readonly changedTrigram: Trigram
  readonly changedHexagram: Hexagram
  readonly arithmetic?: CalculationCheck
}

export interface BodyUseDerivation {
  readonly bodySide: TrigramSide
  readonly useSide: TrigramSide
  readonly body: Trigram
  readonly use: Trigram
  readonly relation: ElementRelationName
  readonly description: string
}

export type DerivationCheckKey = 'upper' | 'lower' | 'moving' | 'main' | 'mutual' | 'changed' | 'body-use'

export interface DerivationCheck {
  readonly key: DerivationCheckKey
  readonly label: string
  readonly verified: boolean
  readonly detail: string
}

export interface CastingDerivation {
  readonly sourceMode: DerivationSourceMode
  readonly sourceStatus: DerivationSourceStatus
  readonly sourceLines: readonly string[]
  readonly trigramMappings: readonly TrigramMapping[]
  readonly main: MainDerivation
  readonly mutual: MutualDerivation
  readonly moving: MovingDerivation
  readonly bodyUse: BodyUseDerivation
  readonly checks: readonly DerivationCheck[]
  readonly consistent: boolean
}

const SIDE_LABEL: Readonly<Record<TrigramSide, string>> = { upper: '上卦', lower: '下卦' }

function lineLabel(position: number, value: YinYang): string {
  const digit = value === 1 ? '九' : '六'
  if (position === 1) return `初${digit}`
  if (position === 6) return `上${digit}`
  return `${digit}${['', '', '二', '三', '四', '五'][position]}`
}

function numberedLines(values: readonly YinYang[]): readonly NumberedLine[] {
  return values.map((value, index) => ({
    position: index + 1,
    value,
    yinYang: value === 1 ? '阳' : '阴',
    label: lineLabel(index + 1, value),
  }))
}

function sameTrigram(first: Trigram, second: Trigram): boolean {
  return first.number === second.number && first.lines.join('') === second.lines.join('')
}

function sameHexagram(first: Hexagram, second: Hexagram): boolean {
  return first.name === second.name && sameTrigram(first.upper, second.upper) && sameTrigram(first.lower, second.lower)
}

function buildMappings(casting: CastingResult): { status: DerivationSourceStatus; mappings: readonly TrigramMapping[] } {
  if (casting.method === 'custom') return { status: 'complete', mappings: [] }
  const checks = casting.calculationChecks
  if (!Array.isArray(checks)) return { status: 'missing-original-source', mappings: [] }
  const mappings = (['upper', 'lower'] as const).flatMap((role) => {
    const check = checks.find((item) => item.role === role)
    if (!check) return []
    return [{
      role,
      source: check.source,
      divisor: 8 as const,
      quotient: check.quotient,
      rawRemainder: check.rawRemainder,
      normalizedValue: check.normalizedValue,
      trigram: check.trigram ?? trigramByNumber(check.normalizedValue),
      verified: check.verified,
    }]
  })
  return { status: mappings.length === 2 ? 'complete' : 'missing-original-source', mappings }
}

function buildMutual(main: Hexagram): { derivation: MutualDerivation; rebuilt: Hexagram } {
  const lowerLines = main.lines.slice(1, 4)
  const upperLines = main.lines.slice(2, 5)
  const lower = trigramByLines(lowerLines)
  const upper = trigramByLines(upperLines)
  const rebuilt = buildHexagram(upper, lower)
  return {
    rebuilt,
    derivation: {
      name: rebuilt.name,
      upper,
      lower,
      upperPositions: [3, 4, 5],
      lowerPositions: [2, 3, 4],
      upperLines,
      lowerLines,
    },
  }
}

function buildMoving(casting: CastingResult): { derivation: MovingDerivation; rebuilt: Hexagram } {
  const values = [...casting.main.lines] as YinYang[]
  const index = casting.movingLine - 1
  const before = values[index]
  const after: YinYang = before === 1 ? 0 : 1
  values[index] = after
  const lower = trigramByLines(values.slice(0, 3))
  const upper = trigramByLines(values.slice(3, 6))
  const rebuilt = buildHexagram(upper, lower)
  const affectedSide: TrigramSide = casting.movingLine <= 3 ? 'lower' : 'upper'
  return {
    rebuilt,
    derivation: {
      position: casting.movingLine,
      label: lineLabel(casting.movingLine, before),
      affectedSide,
      before,
      after,
      originalTrigram: casting.main[affectedSide],
      changedTrigram: rebuilt[affectedSide],
      changedHexagram: rebuilt,
      arithmetic: Array.isArray(casting.calculationChecks)
        ? casting.calculationChecks.find((item) => item.role === 'moving')
        : undefined,
    },
  }
}

export function buildCastingDerivation(casting: CastingResult): CastingDerivation {
  const mappingResult = buildMappings(casting)
  const mainLines = numberedLines(casting.main.lines)
  const rebuiltMain = buildHexagram(trigramByNumber(casting.upperNumber), trigramByNumber(casting.lowerNumber))
  const mutual = buildMutual(casting.main)
  const moving = buildMoving(casting)
  const useSide: TrigramSide = moving.derivation.affectedSide
  const bodySide: TrigramSide = useSide === 'lower' ? 'upper' : 'lower'
  const body = casting.main[bodySide]
  const use = casting.main[useSide]
  const relation = getElementRelation(body.element, use.element)
  const movingNumberVerified = normalizedRemainder(casting.movingLine, 6) === casting.movingLine
    && (!moving.derivation.arithmetic || moving.derivation.arithmetic.normalizedValue === casting.movingLine)

  const checks: readonly DerivationCheck[] = [
    {
      key: 'upper',
      label: '上卦映射',
      verified: casting.upperNumber === casting.main.upper.number,
      detail: `先天数${casting.upperNumber}对应${casting.main.upper.name}卦`,
    },
    {
      key: 'lower',
      label: '下卦映射',
      verified: casting.lowerNumber === casting.main.lower.number,
      detail: `先天数${casting.lowerNumber}对应${casting.main.lower.name}卦`,
    },
    {
      key: 'moving',
      label: '动爻位置',
      verified: movingNumberVerified,
      detail: `动爻为第${casting.movingLine}爻，位于${SIDE_LABEL[useSide]}`,
    },
    {
      key: 'main',
      label: '本卦合成',
      verified: sameHexagram(rebuiltMain, casting.main),
      detail: `${casting.main.upper.name}上${casting.main.lower.name}下合为${casting.main.name}`,
    },
    {
      key: 'mutual',
      label: '互卦取爻',
      verified: sameHexagram(mutual.rebuilt, casting.mutual),
      detail: `上互${mutual.derivation.upper.name}、下互${mutual.derivation.lower.name}合为${mutual.derivation.name}`,
    },
    {
      key: 'changed',
      label: '变卦翻爻',
      verified: sameHexagram(moving.rebuilt, casting.changed),
      detail: `第${casting.movingLine}爻翻转后得到${moving.derivation.changedHexagram.name}`,
    },
    {
      key: 'body-use',
      label: '体用定位',
      verified: bodySide !== useSide,
      detail: `${SIDE_LABEL[bodySide]}为体、${SIDE_LABEL[useSide]}为用，${relation.relation}`,
    },
  ]

  return {
    sourceMode: casting.method === 'custom' ? 'direct' : 'calculated',
    sourceStatus: mappingResult.status,
    sourceLines: casting.calculation,
    trigramMappings: mappingResult.mappings,
    main: {
      name: casting.main.name,
      upper: casting.main.upper,
      lower: casting.main.lower,
      lines: mainLines,
      lowerPositions: [1, 2, 3],
      upperPositions: [4, 5, 6],
    },
    mutual: mutual.derivation,
    moving: moving.derivation,
    bodyUse: {
      bodySide,
      useSide,
      body,
      use,
      relation: relation.relation,
      description: relation.description,
    },
    checks,
    consistent: checks.every((item) => item.verified),
  }
}

export function formatDerivationSummary(casting: CastingResult): string {
  const derivation = buildCastingDerivation(casting)
  const movingBefore = derivation.moving.before === 1 ? '阳' : '阴'
  const movingAfter = derivation.moving.after === 1 ? '阳' : '阴'
  const mapping = derivation.trigramMappings.length > 0
    ? derivation.trigramMappings.map((item) => `${SIDE_LABEL[item.role]}：${item.source}÷8＝${item.quotient}余${item.rawRemainder}，取${item.normalizedValue}为${item.trigram.name}`).join('；')
    : derivation.sourceStatus === 'missing-original-source'
      ? '旧记录未保存原始除法数源'
      : '上下卦与动爻由用户直接指定'
  return [
    '卦象推导',
    mapping,
    `上卦${derivation.main.upper.name}、下卦${derivation.main.lower.name}，合为${derivation.main.name}`,
    `下互取2、3、4爻得${derivation.mutual.lower.name}；上互取3、4、5爻得${derivation.mutual.upper.name}，合为${derivation.mutual.name}`,
    `第${derivation.moving.position}爻由${movingBefore}变${movingAfter}，${derivation.moving.originalTrigram.name}变${derivation.moving.changedTrigram.name}，得到${derivation.moving.changedHexagram.name}`,
    `体卦${derivation.bodyUse.body.name}、用卦${derivation.bodyUse.use.name}，${derivation.bodyUse.relation}`,
  ].join('\n')
}

