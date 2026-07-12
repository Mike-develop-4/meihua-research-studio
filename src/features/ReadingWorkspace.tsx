import { Check, Copy, Printer } from 'lucide-react'
import { useState } from 'react'
import { AnalysisSections } from '../components/AnalysisSections'
import { EvidenceLedger } from '../components/EvidenceLedger'
import { HexagramJourney } from '../components/HexagramJourney'
import { VerdictPanel } from '../components/VerdictPanel'
import { formatReadingReport } from '../domain/report'
import type { ReadingRecord } from '../domain/history'

export function ReadingWorkspace({ record }: { record: ReadingRecord }) {
  const [copied, setCopied] = useState(false)
  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(formatReadingReport(record))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }
  return (
    <main className="reading-workspace">
      <div className="reading-toolbar">
        <div><span>{record.casting.methodLabel}</span><i /> <span>{new Date(record.casting.castAt).toLocaleString('zh-CN')}</span></div>
        <div><button type="button" onClick={copyReport}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? '已复制' : '复制报告'}</button><button type="button" onClick={() => window.print()}><Printer size={16} />打印</button></div>
      </div>
      <VerdictPanel analysis={record.analysis} context={record.context} />
      <HexagramJourney casting={record.casting} analysis={record.analysis} />
      <div className="reading-grid">
        <AnalysisSections analysis={record.analysis} casting={record.casting} />
        <EvidenceLedger analysis={record.analysis} />
      </div>
    </main>
  )
}
