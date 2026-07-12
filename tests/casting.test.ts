import { describe, expect, it } from 'vitest'
import {
  castByDirection,
  castByNumbers,
  castByObjects,
  castByTime,
  castByWordValues,
  castCustom,
  earthlyBranchNumberForHour,
} from '../src/domain/casting'

describe('六种起卦方式', () => {
  it('正确换算十二时辰', () => {
    expect(earthlyBranchNumberForHour(0)).toBe(1)
    expect(earthlyBranchNumberForHour(1)).toBe(2)
    expect(earthlyBranchNumberForHour(20)).toBe(11)
    expect(earthlyBranchNumberForHour(23)).toBe(1)
  })

  it('按农历年月日时进行时间起卦', () => {
    const result = castByTime(new Date(2026, 6, 11, 20, 32, 0))

    expect(result).toMatchObject({
      method: 'time',
      upperNumber: 7,
      lowerNumber: 2,
      movingLine: 2,
      main: { name: '山泽损' },
      lunarInfo: {
        lunarMonth: 5,
        lunarDay: 27,
        yearBranch: '午',
        timeBranch: '戌',
        monthBranch: '未',
      },
    })
    expect(result.calculation.join(' ')).toContain('年支7')
  })

  it('提供数学余数、归一化取数与先天八卦校验', () => {
    const result = castByTime(new Date(2026, 6, 12, 12, 0, 0))

    expect(result).toMatchObject({ upperNumber: 8, lowerNumber: 7, movingLine: 5 })
    expect(result.calculationChecks).toMatchObject([
      { role: 'upper', source: 40, divisor: 8, quotient: 5, rawRemainder: 0, normalizedValue: 8, trigram: { name: '坤', symbol: '☷', nature: '地' }, verified: true },
      { role: 'lower', source: 47, divisor: 8, quotient: 5, rawRemainder: 7, normalizedValue: 7, trigram: { name: '艮', symbol: '☶', nature: '山' }, verified: true },
      { role: 'moving', source: 47, divisor: 6, quotient: 7, rawRemainder: 5, normalizedValue: 5, verified: true },
    ])
  })

  it('支持两数与三数起卦', () => {
    const twoNumbers = castByNumbers(3, 5)
    const threeNumbers = castByNumbers(3, 5, 11)

    expect(twoNumbers).toMatchObject({ upperNumber: 3, lowerNumber: 5, movingLine: 2 })
    expect(threeNumbers).toMatchObject({ upperNumber: 3, lowerNumber: 5, movingLine: 5 })
  })

  it('支持文字取数、物数和物象方位', () => {
    expect(castByWordValues(13, 9)).toMatchObject({ method: 'words', upperNumber: 5, lowerNumber: 1, movingLine: 4 })
    expect(castByObjects(5, 11)).toMatchObject({ method: 'objects', upperNumber: 5, lowerNumber: 3, movingLine: 4 })
    expect(castByDirection(4, 3, 11)).toMatchObject({ method: 'direction', upperNumber: 4, lowerNumber: 3, movingLine: 6 })
  })

  it('支持自定义上下卦和动爻', () => {
    const result = castCustom(1, 8, 1)
    expect(result).toMatchObject({ method: 'custom', main: { name: '天地否' }, mutual: { name: '风山渐' }, changed: { name: '天雷无妄' } })
  })

  it('拒绝无效数源', () => {
    expect(() => castByNumbers(0, 5)).toThrow('必须为正整数')
    expect(() => castCustom(1, 8, 7)).toThrow('动爻')
  })
})
