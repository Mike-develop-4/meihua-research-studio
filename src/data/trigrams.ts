import type { Trigram } from '../domain/types'

export const TRIGRAMS: readonly Trigram[] = [
  { number: 1, name: '乾', symbol: '☰', nature: '天', element: '金', direction: '西北', family: '父', keywords: ['创造', '决策', '权威'], lines: [1, 1, 1] },
  { number: 2, name: '兑', symbol: '☱', nature: '泽', element: '金', direction: '西', family: '少女', keywords: ['交流', '喜悦', '兑现'], lines: [1, 1, 0] },
  { number: 3, name: '离', symbol: '☲', nature: '火', element: '火', direction: '南', family: '中女', keywords: ['显现', '依附', '认知'], lines: [1, 0, 1] },
  { number: 4, name: '震', symbol: '☳', nature: '雷', element: '木', direction: '东', family: '长男', keywords: ['启动', '行动', '突变'], lines: [1, 0, 0] },
  { number: 5, name: '巽', symbol: '☴', nature: '风', element: '木', direction: '东南', family: '长女', keywords: ['渗透', '传播', '协商'], lines: [0, 1, 1] },
  { number: 6, name: '坎', symbol: '☵', nature: '水', element: '水', direction: '北', family: '中男', keywords: ['风险', '深度', '流动'], lines: [0, 1, 0] },
  { number: 7, name: '艮', symbol: '☶', nature: '山', element: '土', direction: '东北', family: '少男', keywords: ['边界', '停止', '积累'], lines: [0, 0, 1] },
  { number: 8, name: '坤', symbol: '☷', nature: '地', element: '土', direction: '西南', family: '母', keywords: ['承载', '执行', '包容'], lines: [0, 0, 0] },
] as const
