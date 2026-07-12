import { describe, expect, it } from 'vitest'
import {
  buildHexagram,
  getChangedHexagram,
  getMutualHexagram,
  trigramByLines,
  trigramByNumber,
} from '../src/domain/hexagrams'

describe('八卦与六十四卦', () => {
  it('使用先天卦数并保持爻序从下到上', () => {
    expect(trigramByNumber(1)).toMatchObject({ name: '乾', lines: [1, 1, 1], element: '金' })
    expect(trigramByNumber(2)).toMatchObject({ name: '兑', lines: [1, 1, 0], element: '金' })
    expect(trigramByNumber(5)).toMatchObject({ name: '巽', lines: [0, 1, 1], element: '木' })
    expect(trigramByNumber(8)).toMatchObject({ name: '坤', lines: [0, 0, 0], element: '土' })
  })

  it('将八的倍数归一为坤卦', () => {
    expect(trigramByNumber(0).name).toBe('坤')
    expect(trigramByNumber(16).name).toBe('坤')
  })

  it('能从爻序反查八卦', () => {
    expect(trigramByLines([1, 0, 0]).name).toBe('震')
    expect(trigramByLines([0, 0, 1]).name).toBe('艮')
  })

  it('构建天地否并计算正确互卦', () => {
    const heavenEarth = buildHexagram(trigramByNumber(1), trigramByNumber(8))

    expect(heavenEarth.name).toBe('天地否')
    expect(heavenEarth.lines).toEqual([0, 0, 0, 1, 1, 1])
    expect(getMutualHexagram(heavenEarth)).toMatchObject({
      name: '风山渐',
      upper: { name: '巽' },
      lower: { name: '艮' },
    })
  })

  it('初爻变化得到天雷无妄且不修改原卦', () => {
    const original = buildHexagram(trigramByNumber(1), trigramByNumber(8))
    const changed = getChangedHexagram(original, 1)

    expect(changed.name).toBe('天雷无妄')
    expect(changed.lines).toEqual([1, 0, 0, 1, 1, 1])
    expect(original.lines).toEqual([0, 0, 0, 1, 1, 1])
  })
})
