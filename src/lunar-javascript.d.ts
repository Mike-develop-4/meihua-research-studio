declare module 'lunar-javascript' {
  export const Solar: {
    fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): {
      getLunar(): {
        getMonth(): number
        getDay(): number
        getYearZhi(): string
        getMonthZhi(): string
        getTimeZhi(): string
        getYearInGanZhi(): string
        getMonthInGanZhi(): string
        getDayInGanZhi(): string
        getMonthInChinese(): string
        getDayInChinese(): string
      }
    }
  }
}
