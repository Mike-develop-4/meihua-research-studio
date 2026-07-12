import { Check } from 'lucide-react'

interface StepRailProps {
  step: 1 | 2 | 3
}

const steps = [
  { number: 1, label: '问事', detail: '明确主体与范围' },
  { number: 2, label: '取数', detail: '选择起卦方法' },
  { number: 3, label: '校验', detail: '复核数源口径' },
] as const

export function StepRail({ step }: StepRailProps) {
  return (
    <aside className="step-rail" aria-label="起卦进度">
      <p className="rail-title">起卦三步</p>
      <ol>
        {steps.map((item) => {
          const state = item.number < step ? 'done' : item.number === step ? 'current' : 'pending'
          return (
            <li key={item.number} className={state} aria-current={state === 'current' ? 'step' : undefined}>
              <span className="step-index">{state === 'done' ? <Check size={14} /> : item.number}</span>
              <span><strong>{item.label}</strong><small>{item.detail}</small></span>
            </li>
          )
        })}
      </ol>
      <div className="rail-note">
        <span>判断原则</span>
        <p>先看力量，再谈生克；先给条件，再谈趋势。</p>
      </div>
    </aside>
  )
}
