import { Archive, RotateCcw } from 'lucide-react'

interface AppHeaderProps {
  historyCount: number
  onHistory: () => void
  onReset: () => void
  compact?: boolean
}

export function AppHeader({ historyCount, onHistory, onReset, compact = false }: AppHeaderProps) {
  return (
    <header className="app-header">
      <button type="button" className="brand" onClick={onReset} aria-label="返回观象首页">
        <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
        <span>
          <h1>观象</h1>
          <small>梅花易数研究台</small>
        </span>
      </button>
      <nav aria-label="应用操作">
        <button type="button" className="header-action" onClick={onHistory} aria-label="打开卦例记录">
          <Archive size={17} />
          <span>卦例</span>
          {historyCount > 0 ? <b>{historyCount}</b> : null}
        </button>
        {compact ? (
          <button type="button" className="header-action primary" onClick={onReset}>
            <RotateCcw size={17} />重新起卦
          </button>
        ) : null}
      </nav>
    </header>
  )
}
