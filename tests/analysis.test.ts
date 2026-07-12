import { describe, expect, it } from 'vitest'
import { analyzeReading, getBodyUse, getElementRelation, getSeasonalStrength } from '../src/domain/analysis'
import { castCustom } from '../src/domain/casting'
import type { QuestionContext } from '../src/domain/types'

const projectQuestion: QuestionContext = {
  question: '病理星球项目未来一年发展如何？',
  category: 'project',
  subject: '项目团队',
  horizon: 'one-year',
}

describe('体用与综合解卦', () => {
  it('按动爻所在上下卦确定体用并保持体位', () => {
    const lowerMoving = castCustom(1, 8, 1)
    const upperMoving = castCustom(1, 8, 5)

    expect(getBodyUse(lowerMoving.main, 1)).toMatchObject({ body: { name: '乾' }, use: { name: '坤' }, bodySide: 'upper' })
    expect(getBodyUse(upperMoving.main, 5)).toMatchObject({ body: { name: '坤' }, use: { name: '乾' }, bodySide: 'lower' })
  })

  it('正确判断五行生克并显示作用方向', () => {
    expect(getElementRelation('金', '土').relation).toBe('用生体')
    expect(getElementRelation('木', '金').relation).toBe('用克体')
    expect(getElementRelation('金', '木').relation).toBe('体克用')
  })

  it('按月令计算旺相休囚死', () => {
    expect(getSeasonalStrength('土', '未')).toBe('旺')
    expect(getSeasonalStrength('金', '未')).toBe('相')
    expect(getSeasonalStrength('木', '未')).toBe('囚')
  })

  it('互卦沿用本卦固定体卦并分别分析上下互对体卦的作用', () => {
    const casting = castCustom(8, 5, 3)
    const summerCasting = { ...casting, lunarInfo: { ...casting.lunarInfo, monthBranch: '未' } }
    const analysis = analyzeReading(summerCasting, projectQuestion)

    expect(casting.main.name).toBe('地风升')
    expect(casting.mutual.name).toBe('雷泽归妹')
    expect(analysis.phases[1]).toMatchObject({
      body: { name: '坤', element: '土' },
      bodyStrength: '旺',
      relationLabel: '用克体＋体生用',
      influences: [
        { role: '上互', trigram: { name: '震', element: '木' }, strength: '囚', relation: '用克体' },
        { role: '下互', trigram: { name: '兑', element: '金' }, strength: '相', relation: '体生用' },
      ],
    })
  })

  it('用克体但体旺用衰时解释为压力可控而不是必败', () => {
    const casting = castCustom(5, 2, 1)
    const springCasting = { ...casting, lunarInfo: { ...casting.lunarInfo, monthBranch: '卯' } }
    const analysis = analyzeReading(springCasting, projectQuestion)

    expect(analysis.phases[0]).toMatchObject({ relation: '用克体', bodyStrength: '旺', useStrength: '囚', severity: 'manageable' })
    expect(analysis.summary.headline).toContain('压力')
    expect(analysis.summary.narrative).toContain('承受')
    expect(analysis.summary.narrative).not.toMatch(/必败|注定|必然失败/)
  })

  it('体衰用旺时提高风险等级但仍给出条件化建议', () => {
    const casting = castCustom(5, 2, 1)
    const autumnCasting = { ...casting, lunarInfo: { ...casting.lunarInfo, monthBranch: '酉' } }
    const analysis = analyzeReading(autumnCasting, projectQuestion)

    expect(analysis.phases[0]).toMatchObject({ relation: '用克体', bodyStrength: '死', useStrength: '旺', severity: 'elevated' })
    expect(analysis.summary.tone).toBe('caution')
    expect(analysis.actions.prevent.length).toBeGreaterThanOrEqual(2)
    expect(analysis.summary.narrative).not.toMatch(/必败|注定/)
  })

  it('为前期有利、后期受制生成矛盾化解和项目行动建议', () => {
    const casting = castCustom(5, 6, 1)
    const analysis = analyzeReading(casting, projectQuestion)

    expect(analysis.phases.map((phase) => phase.label)).toEqual(['基础格局', '内部动力', '后续状态'])
    expect(analysis.contradiction.detail.length).toBeGreaterThan(30)
    expect(analysis.actions.now.join(' ')).toMatch(/资源|目标|验证/)
    expect(analysis.evidence.some((item) => item.kind === 'support')).toBe(true)
    expect(analysis.evidence.some((item) => item.kind === 'pressure')).toBe(true)
    expect(analysis.scoreNote).toContain('不代表客观概率')
  })

  it('健康问事只给关注与求助建议，不输出疾病诊断', () => {
    const analysis = analyzeReading(castCustom(6, 3, 4), { ...projectQuestion, category: 'health', question: '近期健康状态需要注意什么？' })
    const allText = JSON.stringify(analysis)

    expect(allText).toContain('专业')
    expect(allText).not.toMatch(/患有|确诊|癌症|必死/)
  })
})
