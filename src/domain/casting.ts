import { buildHexagram, getChangedHexagram, getMutualHexagram, normalizedRemainder, trigramByNumber } from './hexagrams'
import { earthlyBranchNumber, lunarInfoForDate, type LunarInfo } from './lunar'
import type { CastingMethod, Hexagram, Trigram } from './types'

export type CalculationRole = 'upper' | 'lower' | 'moving'

export interface CalculationCheck {
  readonly role: CalculationRole
  readonly source: number
  readonly divisor: 8 | 6
  readonly quotient: number
  readonly rawRemainder: number
  readonly normalizedValue: number
  readonly trigram?: Trigram
  readonly verified: boolean
}

export interface CastingResult {
  readonly id: string
  readonly method: CastingMethod
  readonly methodLabel: string
  readonly castAt: string
  readonly sourceText: string
  readonly upperNumber: number
  readonly lowerNumber: number
  readonly movingLine: number
  readonly main: Hexagram
  readonly mutual: Hexagram
  readonly changed: Hexagram
  readonly calculation: readonly string[]
  readonly calculationChecks: readonly CalculationCheck[]
  readonly lunarInfo: LunarInfo
}

const METHOD_LABELS: Readonly<Record<CastingMethod, string>> = {
  time: '时间起卦',
  numbers: '报数起卦',
  words: '文字起卦',
  objects: '物数起卦',
  direction: '物象方位',
  custom: '自定义排盘',
}

function assertPositiveInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${label}必须为正整数`)
}

function currentLunarInfo(date = new Date()): LunarInfo {
  return lunarInfoForDate(date)
}

function createCalculationCheck(role: CalculationRole, source: number, divisor: 8 | 6): CalculationCheck {
  const rawRemainder = source % divisor
  const normalizedValue = normalizedRemainder(source, divisor)
  const expectedValue = rawRemainder === 0 ? divisor : rawRemainder
  return {
    role,
    source,
    divisor,
    quotient: Math.floor(source / divisor),
    rawRemainder,
    normalizedValue,
    ...(role === 'moving' ? {} : { trigram: trigramByNumber(normalizedValue) }),
    verified: normalizedValue === expectedValue,
  }
}

function createCasting(
  method: CastingMethod,
  upperSource: number,
  lowerSource: number,
  movingSource: number,
  sourceText: string,
  calculation: readonly string[],
  date = new Date(),
  lunarInfo = currentLunarInfo(date),
): CastingResult {
  assertPositiveInteger(upperSource, '上卦数源')
  assertPositiveInteger(lowerSource, '下卦数源')
  assertPositiveInteger(movingSource, '动爻数源')
  const upperNumber = normalizedRemainder(upperSource, 8)
  const lowerNumber = normalizedRemainder(lowerSource, 8)
  const movingLine = normalizedRemainder(movingSource, 6)
  const main = buildHexagram(trigramByNumber(upperNumber), trigramByNumber(lowerNumber))
  return {
    id: `${date.getTime()}-${method}-${upperSource}-${lowerSource}-${movingSource}`,
    method,
    methodLabel: METHOD_LABELS[method],
    castAt: date.toISOString(),
    sourceText,
    upperNumber,
    lowerNumber,
    movingLine,
    main,
    mutual: getMutualHexagram(main),
    changed: getChangedHexagram(main, movingLine),
    calculation,
    calculationChecks: [
      createCalculationCheck('upper', upperSource, 8),
      createCalculationCheck('lower', lowerSource, 8),
      createCalculationCheck('moving', movingSource, 6),
    ],
    lunarInfo,
  }
}

export function earthlyBranchNumberForHour(hour: number): number {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) throw new Error('小时必须在0至23之间')
  return Math.floor((((hour + 1) % 24) / 2)) + 1
}

export function castByTime(date = new Date()): CastingResult {
  const lunar = lunarInfoForDate(date)
  const yearNumber = earthlyBranchNumber(lunar.yearBranch)
  const timeNumber = earthlyBranchNumber(lunar.timeBranch)
  const upperSource = yearNumber + lunar.lunarMonth + lunar.lunarDay
  const lowerSource = upperSource + timeNumber
  return createCasting(
    'time',
    upperSource,
    lowerSource,
    lowerSource,
    `${lunar.yearGanZhi}年 农历${lunar.lunarMonthText}月${lunar.lunarDayText} ${lunar.timeBranch}时`,
    [
      `上卦数源：年支${yearNumber}＋农历月${lunar.lunarMonth}＋农历日${lunar.lunarDay}＝${upperSource}`,
      `下卦数源：${upperSource}＋时支${timeNumber}＝${lowerSource}`,
      `动爻数源：取下卦总数${lowerSource}`,
    ],
    date,
    lunar,
  )
}

export function castByNumbers(first: number, second: number, third?: number): CastingResult {
  assertPositiveInteger(first, '第一个数')
  assertPositiveInteger(second, '第二个数')
  if (third !== undefined) assertPositiveInteger(third, '第三个数')
  const movingSource = third ?? first + second
  return createCasting(
    'numbers',
    first,
    second,
    movingSource,
    third === undefined ? `两数：${first}、${second}` : `三数：${first}、${second}、${third}`,
    [
      `上卦数源：${first}`,
      `下卦数源：${second}`,
      `动爻数源：${movingSource}`,
    ],
  )
}

export function castByWordValues(upperValue: number, lowerValue: number): CastingResult {
  return createCasting(
    'words', upperValue, lowerValue, upperValue + lowerValue,
    `文字取数：上${upperValue}、下${lowerValue}`,
    [`上卦取数${upperValue}`, `下卦取数${lowerValue}`, `动爻取两数之和${upperValue + lowerValue}`],
  )
}

export function castByObjects(count: number, timeBranchNumber: number): CastingResult {
  return createCasting(
    'objects', count, timeBranchNumber, count + timeBranchNumber,
    `物数${count}，时支数${timeBranchNumber}`,
    [`上卦取物数${count}`, `下卦取时支数${timeBranchNumber}`, `动爻取两数之和${count + timeBranchNumber}`],
  )
}

export function castByDirection(objectTrigramNumber: number, directionTrigramNumber: number, timeBranchNumber: number): CastingResult {
  return createCasting(
    'direction', objectTrigramNumber, directionTrigramNumber,
    objectTrigramNumber + directionTrigramNumber + timeBranchNumber,
    `物象卦数${objectTrigramNumber}，方位卦数${directionTrigramNumber}，时支数${timeBranchNumber}`,
    [`上卦取物象${objectTrigramNumber}`, `下卦取方位${directionTrigramNumber}`, `动爻取三数之和${objectTrigramNumber + directionTrigramNumber + timeBranchNumber}`],
  )
}

export function castCustom(upperNumber: number, lowerNumber: number, movingLine: number): CastingResult {
  if (!Number.isInteger(upperNumber) || upperNumber < 1 || upperNumber > 8) throw new Error('上卦必须在一至八之间')
  if (!Number.isInteger(lowerNumber) || lowerNumber < 1 || lowerNumber > 8) throw new Error('下卦必须在一至八之间')
  if (!Number.isInteger(movingLine) || movingLine < 1 || movingLine > 6) throw new Error('动爻必须在一至六之间')
  return createCasting(
    'custom', upperNumber, lowerNumber, movingLine,
    `上卦${trigramByNumber(upperNumber).name}，下卦${trigramByNumber(lowerNumber).name}，动${movingLine}爻`,
    ['用户直接指定上下卦与动爻，不进行数源换算'],
  )
}
