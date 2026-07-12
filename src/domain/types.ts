export type Element = '木' | '火' | '土' | '金' | '水'
export type YinYang = 0 | 1
export type LineTuple = readonly [YinYang, YinYang, YinYang]

export interface Trigram {
  readonly number: number
  readonly name: string
  readonly symbol: string
  readonly nature: string
  readonly element: Element
  readonly direction: string
  readonly family: string
  readonly keywords: readonly string[]
  readonly lines: LineTuple
}

export interface Hexagram {
  readonly name: string
  readonly upper: Trigram
  readonly lower: Trigram
  readonly lines: readonly YinYang[]
}

export type QuestionCategory = 'project' | 'career' | 'finance' | 'relationship' | 'study' | 'search' | 'health' | 'general'
export type TimeHorizon = 'one-month' | 'three-months' | 'one-year' | 'long-term'
export type ActivityState = 'sitting' | 'standing' | 'walking' | 'running' | 'lying' | 'uncertain'
export type CastingMethod = 'time' | 'numbers' | 'words' | 'objects' | 'direction' | 'custom'

export interface QuestionContext {
  question: string
  category: QuestionCategory
  categoryLabel?: string
  subject: string
  horizon: TimeHorizon
  activityState?: ActivityState
}
