import { describe, expect, it } from 'vitest'
import { analyzeReading } from '../src/domain/analysis'
import { castCustom } from '../src/domain/casting'
import { addReadingRecord, compareReadingRecords, createReadingRecord, deserializeRecords, serializeRecords, toggleFavorite } from '../src/domain/history'
import { formatReadingReport } from '../src/domain/report'
import type { QuestionContext } from '../src/domain/types'

const context: QuestionContext = {
  question: '病理星球项目未来一年发展如何？',
  category: 'project',
  subject: '项目团队',
  horizon: 'one-year',
}

function makeRecord(seed = 1) {
  const casting = castCustom(1, 8, ((seed - 1) % 6) + 1)
  const analysis = analyzeReading(casting, context)
  return createReadingRecord(context, casting, analysis)
}

describe('本地卦例与报告', () => {
  it('使用带版本的数据格式序列化并恢复记录', () => {
    const record = makeRecord()
    const serialized = serializeRecords([record])

    expect(serialized).toContain('"version":1')
    expect(deserializeRecords(serialized)[0]).toMatchObject({
      context: { question: context.question, activityState: 'uncertain' },
      casting: { main: { name: '天地否' } },
    })
  })

  it('损坏数据返回空列表而不让应用崩溃', () => {
    expect(deserializeRecords('{broken')).toEqual([])
    expect(deserializeRecords('null')).toEqual([])
  })

  it('加载旧卦例时按当前规则重新计算分析结果', () => {
    const record = makeRecord(3)
    const legacyPhases = record.analysis.phases.map(({ influences: _influences, relationLabel: _relationLabel, ...phase }) => phase)
    const legacyRecord = { ...record, analysis: { ...record.analysis, phases: legacyPhases } }
    const restored = deserializeRecords(JSON.stringify({ version: 1, records: [legacyRecord] }))

    expect(restored[0].analysis.phases[1].influences).toHaveLength(2)
    expect(restored[0].analysis.phases[1].body.name).toBe(record.analysis.phases[0].body.name)
    expect(restored[0].context.activityState).toBe('uncertain')
    expect(restored[0].analysis.timing.activityState).toBe('uncertain')
  })

  it('新记录置顶且最多保留三十条', () => {
    const records = Array.from({ length: 35 }, (_, index) => makeRecord(index + 1))
    const newest = makeRecord(99)
    const result = addReadingRecord(records, newest)

    expect(result).toHaveLength(30)
    expect(result[0].id).toBe(newest.id)
  })

  it('生成包含结论、证据、行动和免责声明的可复制报告', () => {
    const report = formatReadingReport(makeRecord())

    expect(report).toContain(context.question)
    expect(report).toContain('天地否')
    expect(report).toContain('综合判断')
    expect(report).toContain('行动建议')
    expect(report).toContain('月令五行')
    expect(report).toContain('起卦时状态')
    expect(report).toContain('卦象推导')
    expect(report).toContain('下互取2、3、4爻')
    expect(report).toContain('体卦乾、用卦坤')
    expect(report).toContain('传统文化')
  })

  it('支持收藏卦例和两卦结构化对比', () => {
    const first = makeRecord(1)
    const second = makeRecord(2)
    const toggled = toggleFavorite([first, second], first.id)
    const comparison = compareReadingRecords(first, second)

    expect(toggled[0].favorite).toBe(true)
    expect(comparison).toMatchObject({
      first: { question: context.question },
      second: { question: context.question },
      scoreDelta: second.analysis.score - first.analysis.score,
    })
    expect(comparison.sharedEvidence.length).toBeGreaterThanOrEqual(1)
  })
})
