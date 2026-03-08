import { differenceInCalendarDays, startOfDay } from "date-fns";

// 計算目前是週期的第幾週
export function calcCycleWeekNumber(cycleStartDateStr: string): number {
  const cycleStart = startOfDay(new Date(cycleStartDateStr));
  const today = startOfDay(new Date());
  const diffDays = differenceInCalendarDays(today, cycleStart);
  if (diffDays < 0) return 1;
  if (diffDays > 83) return 12;
  return Math.floor(diffDays / 7) + 1;
}
