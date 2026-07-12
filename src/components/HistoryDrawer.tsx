import { ArrowRight, Heart, Scale, X } from 'lucide-react'
import { useState } from 'react'
import { compareReadingRecords, type ReadingRecord } from '../domain/history'

interface HistoryDrawerProps {
  open: boolean
  records: readonly ReadingRecord[]
  onClose: () => void
  onOpen: (record: ReadingRecord) => void
  onToggleFavorite: (id: string) => void
}

export function HistoryDrawer({ open, records, onClose, onOpen, onToggleFavorite }: HistoryDrawerProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  if (!open) return null
  const selectedRecords = selectedIds
    .map((id) => records.find((record) => record.id === id))
    .filter((record): record is ReadingRecord => Boolean(record))
  const comparison = selectedRecords.length === 2
    ? compareReadingRecords(selectedRecords[0], selectedRecords[1])
    : null

  const toggleComparison = (id: string) => {
    setSelectedIds((current) => current.includes(id)
      ? current.filter((selectedId) => selectedId !== id)
      : [...current.slice(-1), id])
  }

  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <aside className="history-drawer" aria-label="卦例记录">
        <div className="drawer-header"><div><h2>卦例记录</h2><p>本地保存，最多三十条；可收藏或选择两条对照。</p></div><button type="button" aria-label="关闭卦例" onClick={onClose}><X /></button></div>
        {records.length === 0 ? <div className="empty-history"><span>☷</span><strong>还没有保存的卦例</strong><p>完成第一次解卦后，会自动保存在这里。</p></div> : (
          <>
            <div className="history-tools" aria-live="polite">
              <Scale size={15} />
              <span>{selectedIds.length === 0 ? '勾选两条卦例进行对照' : selectedIds.length === 1 ? '再选择一条卦例' : '已选择两条卦例'}</span>
              {selectedIds.length > 0 ? <button type="button" onClick={() => setSelectedIds([])}>清除</button> : null}
            </div>
            <div className="history-list">{records.map((record) => {
              const selected = selectedIds.includes(record.id)
              return (
                <article className={`history-item${selected ? ' selected' : ''}`} key={record.id}>
                  <div className="history-item-actions">
                    <label className="compare-check">
                      <input
                        type="checkbox"
                        checked={selected}
                        aria-label={`选择对比：${record.context.question}`}
                        onChange={() => toggleComparison(record.id)}
                      />
                      <span>对比</span>
                    </label>
                    <button
                      type="button"
                      className={`favorite-button${record.favorite ? ' active' : ''}`}
                      aria-label={`${record.favorite ? '取消收藏' : '收藏卦例'}：${record.context.question}`}
                      aria-pressed={Boolean(record.favorite)}
                      onClick={() => onToggleFavorite(record.id)}
                    >
                      <Heart size={15} fill={record.favorite ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <button type="button" className="history-open" onClick={() => onOpen(record)}>
                    <small>{new Date(record.savedAt).toLocaleString('zh-CN')} · {record.analysis.category.label}</small>
                    <strong>{record.context.question}</strong>
                    <span>{record.casting.main.name} → {record.casting.changed.name}<ArrowRight size={13} /></span>
                  </button>
                </article>
              )
            })}</div>
            {comparison ? (
              <section className="comparison-panel" aria-labelledby="comparison-title">
                <div className="comparison-heading">
                  <span>结构化复盘</span>
                  <h3 id="comparison-title">两卦对照</h3>
                  <p>比较的是两次取卦结构，不代表客观概率。</p>
                </div>
                <div className="comparison-columns">
                  {[comparison.first, comparison.second].map((item, index) => (
                    <article key={`${item.question}-${index}`}>
                      <small>卦例 {index + 1}</small>
                      <strong>{item.question}</strong>
                      <b>{item.path}</b>
                      <p>{item.headline}</p>
                      <span>{item.score}<i>/100</i></span>
                    </article>
                  ))}
                </div>
                <div className="comparison-evidence">
                  <strong>共同证据</strong>
                  <p>{comparison.sharedEvidence.join('；') || '未发现同类证据，需要分别复核。'}</p>
                  <span>分值差异：{comparison.scoreDelta > 0 ? '+' : ''}{comparison.scoreDelta}（卦例 2 − 卦例 1）</span>
                </div>
              </section>
            ) : null}
          </>
        )}
      </aside>
    </div>
  )
}
