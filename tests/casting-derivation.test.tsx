import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CastingDerivation } from '../src/components/CastingDerivation'
import { castByTime, castCustom } from '../src/domain/casting'

describe('共享卦象推导组件', () => {
  it('完整展示时间起卦从数源到体用的一致推导', () => {
    const { container } = render(
      <CastingDerivation casting={castByTime(new Date(2026, 6, 12, 12, 0, 0))} mode="full" />,
    )

    expect(screen.getByRole('region', { name: '卦象完整推导链' })).toBeInTheDocument()
    expect(screen.getByText('余0按8取数')).toBeInTheDocument()
    expect(screen.getByText('1乾 · 2兑 · 3离 · 4震 · 5巽 · 6坎 · 7艮 · 8坤')).toBeInTheDocument()
    expect(screen.getByText('下互取第2、3、4爻')).toBeInTheDocument()
    expect(screen.getByText('上互取第3、4、5爻')).toBeInTheDocument()
    expect(screen.getByText('第5爻：阴爻变阳爻')).toBeInTheDocument()
    expect(screen.getByText('动爻所在上卦为用，下卦为体')).toBeInTheDocument()
    expect(screen.getByText('推导一致')).toBeInTheDocument()
    expect(container.querySelector('.derivation-step-grid')).toBeInTheDocument()
    expect(container.querySelector('.preheaven-map')).toBeInTheDocument()
    expect(container.querySelector('.line-extraction')).toBeInTheDocument()
    expect(container.querySelector('.transformation-comparison')).toBeInTheDocument()
    expect(container.querySelector('.derivation-verification')).toBeInTheDocument()
  })

  it('自定义排盘展示直接指定路径', () => {
    render(<CastingDerivation casting={castCustom(8, 5, 3)} mode="compact" />)

    expect(screen.getByText('直接指定上下卦与动爻')).toBeInTheDocument()
    expect(screen.queryByText('余0按8取数')).not.toBeInTheDocument()
    expect(screen.getByText('第3爻：阳爻变阴爻')).toBeInTheDocument()
  })
})
