import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../src/App'
import { analyzeReading } from '../src/domain/analysis'
import { castCustom } from '../src/domain/casting'
import { createReadingRecord, deserializeRecords, HISTORY_STORAGE_KEY, serializeRecords } from '../src/domain/history'
import type { QuestionContext } from '../src/domain/types'

function seedReading(question: string, movingLine: number) {
  const context: QuestionContext = {
    question,
    category: 'project',
    subject: '项目团队',
    horizon: 'one-year',
  }
  const casting = castCustom(1, 8, movingLine)
  return createReadingRecord(context, casting, analyzeReading(casting, context))
}

describe('起卦向导与解卦工作台', () => {
  beforeEach(() => localStorage.clear())

  it('展示清晰的三步流程和问事语境', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: '观象' })).toBeInTheDocument()
    expect(screen.getByText('问事')).toBeInTheDocument()
    expect(screen.getByText('取数')).toBeInTheDocument()
    expect(screen.getByText('校验')).toBeInTheDocument()
    expect(screen.getByLabelText('所问之事')).toBeInTheDocument()
    expect(screen.getByLabelText('事项类型')).toBeInTheDocument()
  })

  it('完成自定义排盘并进入丰富解卦结果', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('所问之事'), '病理星球项目未来一年发展如何？')
    await user.selectOptions(screen.getByLabelText('事项类型'), 'project')
    await user.type(screen.getByLabelText('求测主体'), '项目团队')
    await user.click(screen.getByRole('button', { name: '下一步：选择起卦方式' }))

    expect(screen.getByRole('heading', { name: '选择起卦方式' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /起卦|自定义排盘/ })).toHaveLength(6)
    await user.click(screen.getByRole('button', { name: '自定义排盘' }))
    await user.selectOptions(screen.getByLabelText('上卦'), '1')
    await user.selectOptions(screen.getByLabelText('下卦'), '8')
    await user.selectOptions(screen.getByLabelText('动爻'), '1')
    await user.click(screen.getByRole('button', { name: '下一步：校验数源' }))

    expect(screen.getByText('天地否')).toBeInTheDocument()
    expect(screen.getByText('风山渐')).toBeInTheDocument()
    expect(screen.getByText('天雷无妄')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '生成完整解读' }))

    expect(screen.getByRole('heading', { name: /条件总体可用|机会与约束并存|压力/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '卦势轨迹' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '证据链' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '行动建议' })).toBeInTheDocument()
    expect(screen.getByText('传统文化解释与情景反思工具')).toBeInTheDocument()
  })

  it('可收藏卦例并选取两条记录生成对照', async () => {
    const user = userEvent.setup()
    const first = seedReading('病理星球项目未来一年发展如何？', 1)
    const second = seedReading('病理星球项目下一阶段资源情况如何？', 4)
    localStorage.setItem(HISTORY_STORAGE_KEY, serializeRecords([first, second]))

    render(<App />)
    await user.click(screen.getByRole('button', { name: '打开卦例记录' }))

    await user.click(screen.getByRole('button', { name: `收藏卦例：${first.context.question}` }))
    expect(screen.getByRole('button', { name: `取消收藏：${first.context.question}` })).toBeInTheDocument()
    expect(deserializeRecords(localStorage.getItem(HISTORY_STORAGE_KEY))[0].favorite).toBe(true)

    await user.click(screen.getByRole('checkbox', { name: `选择对比：${first.context.question}` }))
    await user.click(screen.getByRole('checkbox', { name: `选择对比：${second.context.question}` }))

    expect(screen.getByRole('heading', { name: '两卦对照' })).toBeInTheDocument()
    expect(screen.getByText(first.analysis.summary.headline)).toBeInTheDocument()
    expect(screen.getByText(second.analysis.summary.headline)).toBeInTheDocument()
    expect(screen.getByText('共同证据')).toBeInTheDocument()
    expect(screen.getByText(/分值差异/)).toBeInTheDocument()
  })
})
