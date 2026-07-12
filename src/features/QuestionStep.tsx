import type { ActivityState, QuestionContext, QuestionCategory, TimeHorizon } from '../domain/types'

interface QuestionStepProps {
  value: QuestionContext
  error: string
  onChange: (next: QuestionContext) => void
  onNext: () => void
}

const categories: readonly [QuestionCategory, string][] = [
  ['project', '项目发展'], ['career', '事业职业'], ['finance', '财务事项'], ['relationship', '关系互动'],
  ['study', '学业成长'], ['search', '寻人寻物'], ['health', '健康关注'], ['general', '一般问事'],
]

const horizons: readonly [TimeHorizon, string][] = [
  ['one-month', '未来一个月'], ['three-months', '未来三个月'], ['one-year', '未来一年'], ['long-term', '长期趋势'],
]

const subjects = ['我本人', '项目团队', '伴侣/对方', '家人', '子女', '公司/组织', '合作方'] as const

const activityStates: readonly [ActivityState, string][] = [
  ['uncertain', '不确定 / 未记录'],
  ['sitting', '坐着静止'],
  ['standing', '站立静止'],
  ['walking', '行走中'],
  ['running', '快走或跑动中'],
  ['lying', '躺卧静止'],
]

export function QuestionStep({ value, error, onChange, onNext }: QuestionStepProps) {
  const update = <K extends keyof QuestionContext>(key: K, next: QuestionContext[K]) => onChange({ ...value, [key]: next })
  const categoryValue = value.categoryLabel ?? categories.find(([key]) => key === value.category)?.[1] ?? '一般问事'
  const updateCategory = (next: string) => {
    const matched = categories.find(([, label]) => label === next.trim())
    onChange({ ...value, category: matched?.[0] ?? 'general', categoryLabel: next })
  }
  return (
    <section className="step-panel question-step" aria-labelledby="question-title">
      <div className="section-heading">
        <span>01</span>
        <div><h2 id="question-title">先把问题问清楚</h2><p>同一卦象放在不同事项中，体用所指和现实含义并不相同。</p></div>
      </div>
      <div className="field large-field">
        <label htmlFor="question">所问之事</label>
        <textarea
          id="question"
          value={value.question}
          onChange={(event) => update('question', event.target.value)}
          placeholder="例如：我今年的财运如何？"
          rows={4}
          aria-describedby={error ? 'question-error' : 'question-help'}
        />
        {error ? <p className="field-error" id="question-error">{error}</p> : <p className="field-help" id="question-help">尽量包含对象、时间范围和你真正关心的结果。</p>}
      </div>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="category">事项类型</label>
          <input
            id="category"
            list="category-options"
            value={categoryValue}
            onChange={(event) => updateCategory(event.target.value)}
            placeholder="选择常用类型或直接输入"
          />
          <datalist id="category-options">
            {categories.map(([key, label]) => <option key={key} value={label} />)}
          </datalist>
          <p className="field-help">可选择常用类型，也可输入自定义事项。</p>
        </div>
        <div className="field">
          <label htmlFor="subject">求测主体</label>
          <input id="subject" list="subject-options" value={value.subject} onChange={(event) => update('subject', event.target.value)} placeholder="选择常用主体或直接输入" />
          <datalist id="subject-options">
            {subjects.map((subject) => <option key={subject} value={subject} />)}
          </datalist>
          <p className="field-help">常用选项仅作提示，可以填写任何主体。</p>
        </div>
        <div className="field">
          <label htmlFor="horizon">观察范围</label>
          <select id="horizon" value={value.horizon} onChange={(event) => update('horizon', event.target.value as TimeHorizon)}>
            {horizons.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="activity-state">起卦时状态</label>
          <select id="activity-state" value={value.activityState ?? 'uncertain'} onChange={(event) => update('activityState', event.target.value as ActivityState)}>
            {activityStates.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
          <p className="field-help">记录起念取数当下的身体状态，用于应期快慢校正。</p>
        </div>
      </div>
      <div className="step-actions end"><button type="button" className="button primary" onClick={onNext}>下一步：选择起卦方式</button></div>
    </section>
  )
}
