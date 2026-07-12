import { describe, expect, it } from 'vitest'
import { castByTime, castCustom, type CastingResult } from '../src/domain/casting'
import { buildCastingDerivation, formatDerivationSummary } from '../src/domain/derivation'

describe('卦象完整推导链', () => {
  it('解释余0归一化与先天八卦映射', () => {
    const derivation = buildCastingDerivation(castByTime(new Date(2026, 6, 12, 12, 0, 0)))

    expect(derivation.sourceMode).toBe('calculated')
    expect(derivation.sourceStatus).toBe('complete')
    expect(derivation.trigramMappings).toMatchObject([
      { role: 'upper', source: 40, rawRemainder: 0, normalizedValue: 8, trigram: { name: '坤' } },
      { role: 'lower', source: 47, rawRemainder: 7, normalizedValue: 7, trigram: { name: '艮' } },
    ])
    expect(derivation.moving).toMatchObject({ position: 5, affectedSide: 'upper', before: 0, after: 1 })
  })

  it('逐爻说明本卦、互卦与变卦的生成', () => {
    const derivation = buildCastingDerivation(castCustom(8, 5, 3))

    expect(derivation.main).toMatchObject({
      name: '地风升',
      lowerPositions: [1, 2, 3],
      upperPositions: [4, 5, 6],
      lower: { name: '巽' },
      upper: { name: '坤' },
    })
    expect(derivation.main.lines.map((line) => line.label)).toEqual(['初六', '九二', '九三', '六四', '六五', '上六'])
    expect(derivation.mutual).toMatchObject({
      lowerPositions: [2, 3, 4],
      upperPositions: [3, 4, 5],
      lower: { name: '兑' },
      upper: { name: '震' },
      name: '雷泽归妹',
    })
    expect(derivation.moving).toMatchObject({
      position: 3,
      label: '九三',
      affectedSide: 'lower',
      before: 1,
      after: 0,
      originalTrigram: { name: '巽' },
      changedTrigram: { name: '坎' },
      changedHexagram: { name: '地水师' },
    })
  })

  it('按动爻所在经卦定位体用并给出五行关系', () => {
    const lowerMoving = buildCastingDerivation(castCustom(8, 5, 3))
    const upperMoving = buildCastingDerivation(castCustom(4, 2, 5))

    expect(lowerMoving.bodyUse).toMatchObject({
      bodySide: 'upper', useSide: 'lower', body: { name: '坤' }, use: { name: '巽' }, relation: '用克体',
    })
    expect(upperMoving.bodyUse).toMatchObject({
      bodySide: 'lower', useSide: 'upper', body: { name: '兑' }, use: { name: '震' }, relation: '体克用',
    })
  })

  it('自定义排盘标记为直接指定而不伪造商与余数', () => {
    const derivation = buildCastingDerivation(castCustom(1, 8, 1))

    expect(derivation.sourceMode).toBe('direct')
    expect(derivation.sourceStatus).toBe('complete')
    expect(derivation.trigramMappings).toEqual([])
  })

  it('发现卦象数据不一致时指出具体异常', () => {
    const casting = castCustom(1, 8, 1)
    const corrupted = { ...casting, changed: casting.main }
    const derivation = buildCastingDerivation(corrupted)

    expect(derivation.checks).toContainEqual(expect.objectContaining({ key: 'changed', verified: false }))
    expect(derivation.consistent).toBe(false)
  })

  it('兼容缺少原始余数校验的旧记录', () => {
    const casting = castByTime(new Date(2026, 6, 12, 12, 0, 0))
    const legacy = { ...casting, calculationChecks: undefined } as unknown as CastingResult
    const derivation = buildCastingDerivation(legacy)

    expect(derivation.sourceStatus).toBe('missing-original-source')
    expect(derivation.trigramMappings).toEqual([])
    expect(derivation.main.name).toBe(casting.main.name)
  })

  it('生成可复制的简明推导摘要', () => {
    const summary = formatDerivationSummary(castCustom(8, 5, 3))

    expect(summary).toContain('卦象推导')
    expect(summary).toContain('上卦坤、下卦巽')
    expect(summary).toContain('下互取2、3、4爻得兑')
    expect(summary).toContain('第3爻由阳变阴')
    expect(summary).toContain('体卦坤、用卦巽，用克体')
  })
})
