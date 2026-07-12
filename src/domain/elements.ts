import type { Element } from './types'

export type ElementRelationName = '比和' | '用生体' | '体生用' | '体克用' | '用克体'
export type SeasonalStrength = '旺' | '相' | '休' | '囚' | '死'

const GENERATES: Readonly<Record<Element, Element>> = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' }
const CONTROLS: Readonly<Record<Element, Element>> = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' }
const MONTH_ELEMENT: Readonly<Record<string, Element>> = {
  寅: '木', 卯: '木', 巳: '火', 午: '火', 申: '金', 酉: '金', 亥: '水', 子: '水', 辰: '土', 戌: '土', 丑: '土', 未: '土',
}

export const STRENGTH_RANK: Readonly<Record<SeasonalStrength, number>> = { 旺: 2, 相: 1, 休: 0, 囚: -1, 死: -2 }

export function generates(source: Element, target: Element): boolean {
  return GENERATES[source] === target
}

export function controls(source: Element, target: Element): boolean {
  return CONTROLS[source] === target
}

export function getSeasonalStrength(element: Element, monthBranch: string): SeasonalStrength {
  const season = getMonthElement(monthBranch)
  if (element === season) return '旺'
  if (generates(season, element)) return '相'
  if (generates(element, season)) return '休'
  if (controls(element, season)) return '囚'
  return '死'
}

export function getMonthElement(monthBranch: string): Element {
  const element = MONTH_ELEMENT[monthBranch]
  if (!element) throw new Error(`无法识别月令：${monthBranch}`)
  return element
}

export function getElementRelation(body: Element, use: Element): { relation: ElementRelationName; delta: number; description: string } {
  if (body === use) return { relation: '比和', delta: 8, description: '双方属性一致，协同条件较多，但仍需看旺衰与角色是否同向。' }
  if (generates(use, body)) return { relation: '用生体', delta: 16, description: '外部条件对主体形成补充，较容易获得资源、机会或支持。' }
  if (generates(body, use)) return { relation: '体生用', delta: -8, description: '主体持续向事情投入，成果依赖投入能否形成回报。' }
  if (controls(body, use)) return { relation: '体克用', delta: 9, description: '主体具有一定控制力，但需要投入管理成本，通常不是立即见效。' }
  return { relation: '用克体', delta: -16, description: '外部条件对主体形成约束或压力，严重程度取决于双方旺衰。' }
}
