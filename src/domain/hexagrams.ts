import { HEXAGRAM_NAMES, HEXAGRAM_THEMES } from '../data/hexagrams'
import { TRIGRAMS } from '../data/trigrams'
import type { Hexagram, LineTuple, Trigram, YinYang } from './types'

const linesIndex = new Map(TRIGRAMS.map((trigram) => [trigram.lines.join(''), trigram]))

export function normalizedRemainder(value: number, base: number): number {
  if (!Number.isFinite(value) || !Number.isInteger(base) || base <= 0) {
    throw new Error('取余参数无效')
  }
  const remainder = ((Math.trunc(value) % base) + base) % base
  return remainder === 0 ? base : remainder
}

export function trigramByNumber(value: number): Trigram {
  return TRIGRAMS[normalizedRemainder(value, 8) - 1]
}

export function trigramByLines(lines: readonly YinYang[]): Trigram {
  if (lines.length !== 3) throw new Error('八卦必须由三爻组成')
  const trigram = linesIndex.get(lines.join(''))
  if (!trigram) throw new Error('无法识别的三爻组合')
  return trigram
}

export function buildHexagram(upper: Trigram, lower: Trigram): Hexagram {
  const name = HEXAGRAM_NAMES[`${upper.name}${lower.name}`]
  if (!name) throw new Error(`缺少卦名：${upper.name}${lower.name}`)
  return { name, upper, lower, lines: [...lower.lines, ...upper.lines] }
}

export function getMutualHexagram(hexagram: Hexagram): Hexagram {
  const lower = trigramByLines(hexagram.lines.slice(1, 4) as unknown as LineTuple)
  const upper = trigramByLines(hexagram.lines.slice(2, 5) as unknown as LineTuple)
  return buildHexagram(upper, lower)
}

export function getChangedHexagram(hexagram: Hexagram, movingLine: number): Hexagram {
  if (!Number.isInteger(movingLine) || movingLine < 1 || movingLine > 6) {
    throw new Error('动爻必须在一至六之间')
  }
  const lines = [...hexagram.lines] as YinYang[]
  const index = movingLine - 1
  lines[index] = lines[index] === 1 ? 0 : 1
  const lower = trigramByLines(lines.slice(0, 3))
  const upper = trigramByLines(lines.slice(3, 6))
  return buildHexagram(upper, lower)
}

export function getHexagramTheme(hexagram: Hexagram): string {
  return HEXAGRAM_THEMES[hexagram.name] ?? `${hexagram.upper.keywords[0]}与${hexagram.lower.keywords[0]}相互作用，宜结合问事语境判断`
}
