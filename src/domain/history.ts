import { analyzeReading, type ReadingAnalysis } from './analysis'
import type { CastingResult } from './casting'
import type { QuestionContext } from './types'

export interface ReadingRecord {
  readonly id: string
  readonly savedAt: string
  readonly context: QuestionContext
  readonly casting: CastingResult
  readonly analysis: ReadingAnalysis
  readonly favorite?: boolean
}

interface ReadingStoreV1 {
  version: 1
  records: ReadingRecord[]
}

export const HISTORY_STORAGE_KEY = 'meihua-research-studio:readings:v1'

export function createReadingRecord(
  context: QuestionContext,
  casting: CastingResult,
  analysis: ReadingAnalysis,
): ReadingRecord {
  return {
    id: `${casting.id}-${context.question.trim().slice(0, 16)}`,
    savedAt: new Date().toISOString(),
    context: { ...context, question: context.question.trim(), subject: context.subject.trim() },
    casting,
    analysis,
  }
}

export function serializeRecords(records: readonly ReadingRecord[]): string {
  const payload: ReadingStoreV1 = { version: 1, records: [...records].slice(0, 30) }
  return JSON.stringify(payload)
}

export function deserializeRecords(raw: string | null): ReadingRecord[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return []
    const store = parsed as Partial<ReadingStoreV1>
    if (store.version !== 1 || !Array.isArray(store.records)) return []
    const validRecords = store.records.filter((record): record is ReadingRecord => Boolean(
      record && typeof record === 'object' && record.id && record.context?.question && record.casting?.main?.name && record.analysis?.summary?.headline,
    )).slice(0, 30)
    return validRecords.flatMap((record) => {
      try {
        return [{ ...record, analysis: analyzeReading(record.casting, record.context) }]
      } catch {
        return []
      }
    })
  } catch {
    return []
  }
}

export function addReadingRecord(records: readonly ReadingRecord[], next: ReadingRecord): ReadingRecord[] {
  return [next, ...records.filter((record) => record.id !== next.id)].slice(0, 30)
}

export function toggleFavorite(records: readonly ReadingRecord[], id: string): ReadingRecord[] {
  return records.map((record) => record.id === id ? { ...record, favorite: !record.favorite } : record)
}

export interface ReadingComparison {
  first: { question: string; path: string; score: number; headline: string }
  second: { question: string; path: string; score: number; headline: string }
  scoreDelta: number
  sharedEvidence: string[]
}

export function compareReadingRecords(first: ReadingRecord, second: ReadingRecord): ReadingComparison {
  const firstKinds = new Set(first.analysis.evidence.map((item) => item.kind))
  const sharedEvidence = [...new Set(second.analysis.evidence.filter((item) => firstKinds.has(item.kind)).map((item) => (
    item.kind === 'support' ? '两卦都有支持因素' : item.kind === 'pressure' ? '两卦都有压力因素' : '两卦都有中性条件'
  )))]
  const summarize = (record: ReadingRecord) => ({
    question: record.context.question,
    path: `${record.casting.main.name} → ${record.casting.changed.name}`,
    score: record.analysis.score,
    headline: record.analysis.summary.headline,
  })
  return {
    first: summarize(first), second: summarize(second),
    scoreDelta: second.analysis.score - first.analysis.score,
    sharedEvidence,
  }
}
