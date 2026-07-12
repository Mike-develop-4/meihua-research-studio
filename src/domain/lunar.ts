import { Solar } from 'lunar-javascript'

const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const

export interface LunarInfo {
  lunarMonth: number
  lunarDay: number
  lunarMonthText: string
  lunarDayText: string
  yearBranch: string
  monthBranch: string
  timeBranch: string
  yearGanZhi: string
  monthGanZhi: string
  dayGanZhi: string
}

export function earthlyBranchNumber(branch: string): number {
  const index = EARTHLY_BRANCHES.indexOf(branch as (typeof EARTHLY_BRANCHES)[number])
  if (index < 0) throw new Error(`无法识别地支：${branch}`)
  return index + 1
}

export function lunarInfoForDate(date: Date): LunarInfo {
  if (Number.isNaN(date.getTime())) throw new Error('日期无效')
  const solar = Solar.fromYmdHms(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  )
  const lunar = solar.getLunar()
  return {
    lunarMonth: Math.abs(lunar.getMonth()),
    lunarDay: lunar.getDay(),
    lunarMonthText: lunar.getMonthInChinese(),
    lunarDayText: lunar.getDayInChinese(),
    yearBranch: lunar.getYearZhi(),
    monthBranch: lunar.getMonthZhi(),
    timeBranch: lunar.getTimeZhi(),
    yearGanZhi: lunar.getYearInGanZhi(),
    monthGanZhi: lunar.getMonthInGanZhi(),
    dayGanZhi: lunar.getDayInGanZhi(),
  }
}

export { EARTHLY_BRANCHES }
