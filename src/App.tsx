import { useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { HistoryDrawer } from './components/HistoryDrawer'
import { StepRail } from './components/StepRail'
import { analyzeReading } from './domain/analysis'
import type { CastingResult } from './domain/casting'
import { addReadingRecord, createReadingRecord, deserializeRecords, HISTORY_STORAGE_KEY, serializeRecords, toggleFavorite, type ReadingRecord } from './domain/history'
import type { QuestionContext } from './domain/types'
import { MethodStep } from './features/MethodStep'
import { QuestionStep } from './features/QuestionStep'
import { ReadingWorkspace } from './features/ReadingWorkspace'
import { ReviewStep } from './features/ReviewStep'

const initialContext: QuestionContext = {
  question: '',
  category: 'general',
  categoryLabel: '',
  subject: '',
  horizon: 'one-year',
  activityState: 'uncertain',
}

const returnToTop = () => window.scrollTo({ top: 0, behavior: 'auto' })

export default function App() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [context, setContext] = useState<QuestionContext>(initialContext)
  const [questionError, setQuestionError] = useState('')
  const [preview, setPreview] = useState<CastingResult | null>(null)
  const [current, setCurrent] = useState<ReadingRecord | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [records, setRecords] = useState<ReadingRecord[]>(() => deserializeRecords(localStorage.getItem(HISTORY_STORAGE_KEY)))

  const reset = () => {
    setStep(1)
    setPreview(null)
    setCurrent(null)
    setQuestionError('')
    setHistoryOpen(false)
    returnToTop()
  }

  const enterMethods = () => {
    if (context.question.trim().length < 6) {
      setQuestionError('请用至少六个字说明所问之事。')
      return
    }
    setQuestionError('')
    setStep(2)
    returnToTop()
  }

  const reviewCasting = (casting: CastingResult) => {
    setPreview(casting)
    setStep(3)
    returnToTop()
  }

  const generateReading = () => {
    if (!preview) return
    const analysis = analyzeReading(preview, context)
    const record = createReadingRecord(context, preview, analysis)
    setCurrent(record)
    returnToTop()
    setRecords((existing) => {
      const next = addReadingRecord(existing, record)
      localStorage.setItem(HISTORY_STORAGE_KEY, serializeRecords(next))
      return next
    })
  }

  const openRecord = (record: ReadingRecord) => {
    setCurrent(record)
    setContext(record.context)
    setPreview(record.casting)
    setHistoryOpen(false)
    returnToTop()
  }

  const toggleRecordFavorite = (id: string) => {
    setRecords((existing) => {
      const next = toggleFavorite(existing, id)
      localStorage.setItem(HISTORY_STORAGE_KEY, serializeRecords(next))
      return next
    })
  }

  return (
    <div className="app-shell" data-visual-theme="apple">
      <AppHeader historyCount={records.length} onHistory={() => setHistoryOpen(true)} onReset={reset} compact={Boolean(current)} />
      {current ? (
        <ReadingWorkspace record={current} />
      ) : (
        <main className="casting-shell">
          <StepRail step={step} />
          <div className="casting-main">
            {step === 1 ? <QuestionStep value={context} error={questionError} onChange={setContext} onNext={enterMethods} /> : null}
            {step === 2 ? <MethodStep onBack={() => setStep(1)} onReady={reviewCasting} /> : null}
            {step === 3 && preview ? <ReviewStep result={preview} onBack={() => setStep(2)} onGenerate={generateReading} /> : null}
          </div>
          <aside className="casting-aside">
            <p>研究提示</p>
            <strong>{step === 1 ? '问题决定体用所指' : step === 2 ? '同一问题不反复起卦' : '先复核，再解释'}</strong>
            <span>{step === 1 ? '请明确“谁”在问、“问什么”和观察多久。' : step === 2 ? '选择最贴近当下触机的起卦方式，并保持取数口径一致。' : '数源、余数和动爻均可人工复算，避免黑箱结论。'}</span>
          </aside>
        </main>
      )}
      <HistoryDrawer
        open={historyOpen}
        records={records}
        onClose={() => setHistoryOpen(false)}
        onOpen={openRecord}
        onToggleFavorite={toggleRecordFavorite}
      />
    </div>
  )
}
