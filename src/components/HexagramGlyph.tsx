import type { Hexagram } from '../domain/types'

interface HexagramGlyphProps {
  hexagram: Hexagram
  movingLine?: number
  compact?: boolean
}

export function HexagramGlyph({ hexagram, movingLine, compact = false }: HexagramGlyphProps) {
  return (
    <div className={`hexagram-glyph ${compact ? 'compact' : ''}`} aria-label={`${hexagram.name}卦象`}>
      {[...hexagram.lines].reverse().map((line, index) => {
        const position = 6 - index
        return (
          <div key={position} className={`yao ${line === 1 ? 'yang' : 'yin'} ${movingLine === position ? 'moving' : ''}`}>
            {line === 1 ? <i /> : <><i /><i /></>}
            {movingLine === position ? <b aria-label={`第${position}爻动`}>动</b> : null}
          </div>
        )
      })}
    </div>
  )
}
