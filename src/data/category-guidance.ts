import type { QuestionCategory } from '../domain/types'

export interface CategoryGuidance {
  label: string
  focus: string
  bodyRole: string
  useRole: string
  now: readonly string[]
  prevent: readonly string[]
  observe: readonly string[]
}

export const CATEGORY_GUIDANCE: Readonly<Record<QuestionCategory, CategoryGuidance>> = {
  project: {
    label: '项目发展', focus: '资源承载、执行节奏、合作权与外部约束', bodyRole: '项目团队与核心承载能力', useRole: '市场、客户、合作方及项目任务',
    now: ['把目标拆成可验证的近期里程碑', '盘点资金、团队和关键资源的真实余量', '优先验证最影响成败的核心假设'],
    prevent: ['提前约定合作边界、数据权属和决策权', '为扩张后的维护、合规与交付成本留出缓冲'],
    observe: ['观察客户需求是否持续而非短期热度', '观察团队负荷是否随规模出现非线性上升'],
  },
  career: {
    label: '事业职业', focus: '岗位控制力、机会质量、组织关系与长期积累', bodyRole: '求测者的能力、位置与选择权', useRole: '岗位、组织、上级与外部机会',
    now: ['明确下一阶段最能积累选择权的能力', '用具体成果验证机会而非只看承诺'],
    prevent: ['避免在权责不清时承担无限责任', '保留可迁移的成果记录和人际信用'],
    observe: ['观察决策权与资源是否匹配', '观察组织变化对核心职责的影响'],
  },
  finance: {
    label: '财务事项', focus: '现金流、控制力、风险暴露和兑现路径', bodyRole: '自身资金承受力与决策纪律', useRole: '标的、交易对手和市场条件',
    now: ['先核算最坏情形下的现金流承受力', '把收益预期拆成可验证条件'],
    prevent: ['控制单一事项的风险暴露', '不要用传统占断替代专业财务判断'],
    observe: ['观察兑现条件是否真实发生', '观察风险是否集中在单一时间窗口'],
  },
  relationship: {
    label: '关系互动', focus: '双方需求、沟通方式、边界与持续意愿', bodyRole: '求测者的态度、边界与行动', useRole: '对方及关系中的外部条件',
    now: ['把猜测转化为一次清晰而尊重的沟通', '区分短期情绪与长期需求'],
    prevent: ['避免用卦象替对方作出决定', '不要在边界模糊时持续单向消耗'],
    observe: ['观察行动是否与表达一致', '观察冲突后是否能形成新的合作方式'],
  },
  study: {
    label: '学业成长', focus: '基础、方法、反馈和稳定投入', bodyRole: '学习者的基础与执行力', useRole: '目标、考试、课程及评价标准',
    now: ['用一次小测定位真实薄弱点', '把复习计划落到每天可完成的动作'],
    prevent: ['避免频繁更换方法造成重复起步', '为疲劳和突发事务预留弹性'],
    observe: ['观察错误类型是否在减少', '观察投入是否转化为稳定输出'],
  },
  search: {
    label: '寻人寻物', focus: '线索质量、方向、时间窗口和人为阻碍', bodyRole: '寻找者与可调动的线索', useRole: '目标对象及其所处环境',
    now: ['从最后一次确定信息向外建立时间线', '优先核实最可靠的现实线索'],
    prevent: ['避免被未经核实的信息分散注意力', '涉及人员安全时立即联系有关机构'],
    observe: ['观察重复出现的地点、人员或时间信息', '观察是否存在信息延迟或沟通误差'],
  },
  health: {
    label: '健康关注', focus: '生活节律、压力信号和及时求助', bodyRole: '自身状态与恢复能力', useRole: '环境负荷、生活习惯和外部压力',
    now: ['记录持续出现的身体信号与生活变化', '如有不适或疑虑，及时咨询合格的专业医疗人员'],
    prevent: ['不要根据卦象自行诊断或停用治疗', '避免长期透支睡眠、饮食与恢复时间'],
    observe: ['观察症状持续时间和变化趋势', '观察压力、睡眠与身体感受之间的联系'],
  },
  general: {
    label: '一般问事', focus: '主体能力、外部条件、转折和行动边界', bodyRole: '求测者及其可控制部分', useRole: '所问之事与外部条件',
    now: ['明确自己真正可以控制的下一步', '用现实信息校验最关键的假设'],
    prevent: ['避免把单一象意当作确定事实', '为不确定性保留调整空间'],
    observe: ['观察关键条件是否持续', '观察行动后反馈是否支持原判断'],
  },
}
