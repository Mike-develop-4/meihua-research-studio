import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
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
    activityState: 'uncertain',
  }
  const casting = castCustom(1, 8, movingLine)
  return createReadingRecord(context, casting, analyzeReading(casting, context))
}

describe('起卦向导与解卦工作台', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
  })
  afterEach(() => vi.restoreAllMocks())

  it('展示清晰的三步流程和问事语境', () => {
    render(<App />)

    expect(document.querySelector('.app-shell')).toHaveAttribute('data-visual-theme', 'apple')
    expect(screen.getByRole('heading', { name: '观象' })).toBeInTheDocument()
    expect(screen.getByText('问事')).toBeInTheDocument()
    expect(screen.getByText('取数')).toBeInTheDocument()
    expect(screen.getByText('校验')).toBeInTheDocument()
    expect(screen.getByLabelText('所问之事')).toBeInTheDocument()
    expect(screen.getByLabelText('事项类型')).toBeInTheDocument()
    expect(screen.getByLabelText('事项类型')).toHaveValue('')
    expect(screen.getByLabelText('所问之事')).toHaveAttribute('placeholder', '例如：我今年的财运如何？')
    expect(screen.getByLabelText('事项类型')).toHaveAttribute('list', 'category-options')
    expect(screen.getByLabelText('求测主体')).toHaveAttribute('list', 'subject-options')
    expect(screen.getByLabelText('起卦时状态')).toHaveValue('uncertain')
  })

  it('记录起卦时动静并在结果页公开月令与应期校正', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('所问之事'), '我今年的财运发展如何？')
    await user.selectOptions(screen.getByLabelText('起卦时状态'), 'walking')
    await user.click(screen.getByRole('button', { name: '下一步：选择起卦方式' }))
    await user.click(screen.getByRole('button', { name: '自定义排盘' }))
    await user.click(screen.getByRole('button', { name: '下一步：校验数源' }))
    await user.click(screen.getByRole('button', { name: '生成完整解读' }))

    expect(screen.getByRole('heading', { name: '月令与旺衰' })).toBeInTheDocument()
    expect(screen.getAllByText(/月令五行/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/起卦时状态：行走中/)).toBeInTheDocument()
    expect(screen.getByText(/行则事应速/)).toBeInTheDocument()
  })

  it('支持自定义事项类型和自定义求测主体并带入解卦结果', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('所问之事'), '我今年的家庭规划进展如何？')
    await user.clear(screen.getByLabelText('事项类型'))
    await user.type(screen.getByLabelText('事项类型'), '家庭规划')
    await user.type(screen.getByLabelText('求测主体'), '我们全家')
    await user.click(screen.getByRole('button', { name: '下一步：选择起卦方式' }))
    await user.click(screen.getByRole('button', { name: '自定义排盘' }))
    await user.click(screen.getByRole('button', { name: '下一步：校验数源' }))
    await user.click(screen.getByRole('button', { name: '生成完整解读' }))

    expect(screen.getByText('家庭规划')).toBeInTheDocument()
    expect(screen.getByText('主体：我们全家')).toBeInTheDocument()
    expect(screen.getByText(/体：求测者及其可控制部分/)).toBeInTheDocument()
  })

  it('切换起卦步骤时回到页面顶部', async () => {
    const scrollTo = vi.mocked(window.scrollTo)
    render(<App />)

    fireEvent.change(screen.getByLabelText('所问之事'), { target: { value: '我今年的财运发展如何？' } })
    fireEvent.click(screen.getByRole('button', { name: '下一步：选择起卦方式' }))

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })

  it('完成自定义排盘并进入丰富解卦结果', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('所问之事'), '病理星球项目未来一年发展如何？')
    await user.clear(screen.getByLabelText('事项类型'))
    await user.type(screen.getByLabelText('事项类型'), '项目发展')
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
