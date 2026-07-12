import { useMemo, useState } from 'react'
import { CalendarClock, Compass, Hash, Keyboard, MousePointer2, SlidersHorizontal } from 'lucide-react'
import { castByDirection, castByNumbers, castByObjects, castByTime, castByWordValues, castCustom, earthlyBranchNumberForHour, type CastingResult } from '../domain/casting'
import type { CastingMethod } from '../domain/types'
import { TRIGRAMS } from '../data/trigrams'

interface MethodStepProps {
  onBack: () => void
  onReady: (result: CastingResult) => void
}

const methods = [
  { key: 'time', label: '时间起卦', detail: '农历年月日时', icon: CalendarClock },
  { key: 'numbers', label: '报数起卦', detail: '两数或三数', icon: Hash },
  { key: 'words', label: '文字起卦', detail: '笔画、声调或字数', icon: Keyboard },
  { key: 'objects', label: '物数起卦', detail: '观物计数', icon: MousePointer2 },
  { key: 'direction', label: '物象方位起卦', detail: '物象与空间', icon: Compass },
  { key: 'custom', label: '自定义排盘', detail: '直接指定卦象', icon: SlidersHorizontal },
] as const

function localDateTimeValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function MethodStep({ onBack, onReady }: MethodStepProps) {
  const now = useMemo(() => new Date(), [])
  const [method, setMethod] = useState<CastingMethod>('time')
  const [dateTime, setDateTime] = useState(localDateTimeValue(now))
  const [first, setFirst] = useState(3)
  const [second, setSecond] = useState(5)
  const [third, setThird] = useState('')
  const [wordUpper, setWordUpper] = useState(13)
  const [wordLower, setWordLower] = useState(9)
  const [objectCount, setObjectCount] = useState(5)
  const [objectGua, setObjectGua] = useState(4)
  const [directionGua, setDirectionGua] = useState(3)
  const [timeBranch, setTimeBranch] = useState(earthlyBranchNumberForHour(now.getHours()))
  const [customUpper, setCustomUpper] = useState(1)
  const [customLower, setCustomLower] = useState(8)
  const [movingLine, setMovingLine] = useState(1)
  const [error, setError] = useState('')

  const createResult = () => {
    try {
      const result = method === 'time' ? castByTime(new Date(dateTime))
        : method === 'numbers' ? castByNumbers(first, second, third ? Number(third) : undefined)
          : method === 'words' ? castByWordValues(wordUpper, wordLower)
            : method === 'objects' ? castByObjects(objectCount, timeBranch)
              : method === 'direction' ? castByDirection(objectGua, directionGua, timeBranch)
                : castCustom(customUpper, customLower, movingLine)
      setError('')
      onReady(result)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '无法完成起卦，请检查输入')
    }
  }

  const trigramOptions = TRIGRAMS.map((trigram) => <option key={trigram.number} value={trigram.number}>{trigram.symbol} {trigram.name} · {trigram.nature}</option>)
  return (
    <section className="step-panel method-step" aria-labelledby="method-title">
      <div className="section-heading">
        <span>02</span>
        <div><h2 id="method-title">选择起卦方式</h2><p>保留传统六法，并把每一步数源公开给你复核。</p></div>
      </div>
      <div className="method-strip" role="group" aria-label="起卦方式">
        {methods.map((item) => {
          const Icon = item.icon
          return (
            <button key={item.key} type="button" aria-label={item.label} className={method === item.key ? 'selected' : ''} aria-pressed={method === item.key} onClick={() => setMethod(item.key)}>
              <Icon size={20} /><strong>{item.label}</strong><small>{item.detail}</small>
            </button>
          )
        })}
      </div>
      <div className="method-form">
        {method === 'time' ? (
          <div className="field"><label htmlFor="cast-time">起卦日期时间</label><input id="cast-time" type="datetime-local" value={dateTime} onChange={(event) => setDateTime(event.target.value)} /><p className="field-help">采用年支数＋农历月＋农历日＋时支数。</p></div>
        ) : null}
        {method === 'numbers' ? (
          <div className="form-grid compact"><div className="field"><label htmlFor="first-number">上卦数</label><input id="first-number" type="number" min="1" value={first} onChange={(e) => setFirst(Number(e.target.value))} /></div><div className="field"><label htmlFor="second-number">下卦数</label><input id="second-number" type="number" min="1" value={second} onChange={(e) => setSecond(Number(e.target.value))} /></div><div className="field"><label htmlFor="third-number">动爻数（可选）</label><input id="third-number" type="number" min="1" value={third} onChange={(e) => setThird(e.target.value)} placeholder="留空则两数相加" /></div></div>
        ) : null}
        {method === 'words' ? (
          <><div className="method-note">短句可按笔画，四至十字可按声调，更长文本可直接按字数；请保持前后口径一致。</div><div className="form-grid compact"><div className="field"><label htmlFor="word-upper">上部取数</label><input id="word-upper" type="number" min="1" value={wordUpper} onChange={(e) => setWordUpper(Number(e.target.value))} /></div><div className="field"><label htmlFor="word-lower">下部取数</label><input id="word-lower" type="number" min="1" value={wordLower} onChange={(e) => setWordLower(Number(e.target.value))} /></div></div></>
        ) : null}
        {method === 'objects' ? (
          <div className="form-grid compact"><div className="field"><label htmlFor="object-count">物品数量</label><input id="object-count" type="number" min="1" value={objectCount} onChange={(e) => setObjectCount(Number(e.target.value))} /></div><div className="field"><label htmlFor="object-time">时支数</label><input id="object-time" type="number" min="1" max="12" value={timeBranch} onChange={(e) => setTimeBranch(Number(e.target.value))} /></div></div>
        ) : null}
        {method === 'direction' ? (
          <div className="form-grid compact"><div className="field"><label htmlFor="object-gua">物象所属卦</label><select id="object-gua" value={objectGua} onChange={(e) => setObjectGua(Number(e.target.value))}>{trigramOptions}</select></div><div className="field"><label htmlFor="direction-gua">方位所属卦</label><select id="direction-gua" value={directionGua} onChange={(e) => setDirectionGua(Number(e.target.value))}>{trigramOptions}</select></div><div className="field"><label htmlFor="direction-time">时支数</label><input id="direction-time" type="number" min="1" max="12" value={timeBranch} onChange={(e) => setTimeBranch(Number(e.target.value))} /></div></div>
        ) : null}
        {method === 'custom' ? (
          <div className="form-grid compact"><div className="field"><label htmlFor="custom-upper">上卦</label><select id="custom-upper" value={customUpper} onChange={(e) => setCustomUpper(Number(e.target.value))}>{trigramOptions}</select></div><div className="field"><label htmlFor="custom-lower">下卦</label><select id="custom-lower" value={customLower} onChange={(e) => setCustomLower(Number(e.target.value))}>{trigramOptions}</select></div><div className="field"><label htmlFor="moving-line">动爻</label><select id="moving-line" value={movingLine} onChange={(e) => setMovingLine(Number(e.target.value))}>{[1, 2, 3, 4, 5, 6].map((line) => <option key={line} value={line}>{line}爻</option>)}</select></div></div>
        ) : null}
        {error ? <p className="field-error" role="alert">{error}</p> : null}
      </div>
      <div className="step-actions"><button type="button" className="button ghost" onClick={onBack}>返回问事</button><button type="button" className="button primary" onClick={createResult}>下一步：校验数源</button></div>
    </section>
  )
}
