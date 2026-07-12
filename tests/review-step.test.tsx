import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { castByTime } from '../src/domain/casting'
import { ReviewStep } from '../src/features/ReviewStep'

describe('数源与卦象校验', () => {
  it('显示从数源到体用的完整共享推导链', () => {
    const result = castByTime(new Date(2026, 6, 12, 12, 0, 0))

    render(<ReviewStep result={result} onBack={() => undefined} onGenerate={() => undefined} />)

    expect(screen.getByRole('region', { name: '卦象完整推导链' })).toBeInTheDocument()
    expect(screen.getByText('余0按8取数')).toBeInTheDocument()
    expect(screen.getByText('取数8 → ☷ 坤卦')).toBeInTheDocument()
    expect(screen.getByText('取数7 → ☶ 艮卦')).toBeInTheDocument()
    expect(screen.getByText('下互取第2、3、4爻')).toBeInTheDocument()
    expect(screen.getByText('第5爻：阴爻变阳爻')).toBeInTheDocument()
    expect(screen.getByText('动爻所在上卦为用，下卦为体')).toBeInTheDocument()
    expect(screen.getByText('全部校验通过')).toBeInTheDocument()
  })
})
