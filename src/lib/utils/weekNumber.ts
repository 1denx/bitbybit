import { differenceInCalendarDays, addDays, format, startOfDay } from "date-fns";

// 週期結束日 = 開始日 + 83 天 (12週 * 7天 -1)
export function calcEndDate(startDate: Date): Date {
  return addDays(startDate, 83);
}

// 計算目前是週期第幾週，超出範圍回傳 null
export function getCurrentWeekNumber(startDateStr: string): number | null {
  const start = startOfDay(new Date(startDateStr));
  const today = startOfDay(new Date());
  const diff = differenceInCalendarDays(today, start);
  if (diff < 0 || diff > 83) return null;
  return Math.floor(diff / 7) + 1;
}

// 格式化日期顯示
export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), "yyyy/MM/dd");
}

// 格式化日期範圍
export function formatDateRange(startStr: string, endStr: string): string {
  const start = format(new Date(startStr), "yyyy/MM/dd");
  const end = format(new Date(endStr), "MM/dd");

  return `${start} - ${end}`;
}
