import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { castByTime } from '../src/domain/casting'
import { ReviewStep } from '../src/features/ReviewStep'

describe('数源与卦象校验', () => {
  it('显示数学余数、归一化规则和对应先天八卦', () => {
    const result = castByTime(new Date(2026, 6, 12, 12, 0, 0))

    render(<ReviewStep result={result} onBack={() => undefined} onGenerate={() => undefined} />)

    expect(screen.getByText('余0按8取数')).toBeInTheDocument()
    expect(screen.getByText('8 → 坤卦（☷，地）')).toBeInTheDocument()
    expect(screen.getByText('7 → 艮卦（☶，山）')).toBeInTheDocument()
    expect(screen.getByText('取第5爻')).toBeInTheDocument()
    expect(screen.getAllByText('已校验')).toHaveLength(3)
  })
})
