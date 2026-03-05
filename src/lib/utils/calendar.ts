import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addWeeks,
  subWeeks,
  isSameDay,
  isToday,
  parseISO,
  addMinutes,
} from "date-fns";
import { zhTW } from "date-fns/locale";

export const SLOT_HEIGHT = 28; // 時間格高度，30分鐘為1個單位
export const SLOT_PER_HOUR = 2; // 1小時2格
export const START_HOUR = 6;
export const END_HOUR = 23;

// 取得一週的所有天
export function getWeekDays(weekStart: Date): Date[] {
  return eachDayOfInterval({
    start: startOfWeek(weekStart, { weekStartsOn: 1 }),
    end: endOfWeek(weekStart, { weekStartsOn: 1 }),
  });
}

// 取得本週的週一
export function getThisWeekStart(): Date {
  return startOfWeek(new Date(), { weekStartsOn: 1 });
}

// 下一週
export function getNextWeekStart(currentWeekStart: Date): Date {
  return addWeeks(currentWeekStart, 1);
}

// 上一週
export function getPrevWeekStart(currentWeekStart: Date): Date {
  return subWeeks(currentWeekStart, 1);
}

// 格式化週標題
export function formatWeekTitle(weekStart: Date): string {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const startStr = format(weekStart, "M/d");
  const endStr = format(weekEnd, "M/d");
  const year = format(weekStart, "yyyy");
  return `${year} ${startStr} – ${endStr}`;
}

// 格式化星期顯示
export function formatDayLabel(date: Date): string {
  return format(date, "EEE", { locale: zhTW }).toUpperCase();
}

export function formatDatNumber(date: Date): number {
  return parseInt(format(date, "d"));
}

// 時間字串轉成距離 START_HOUR 的像素 top
export function timeToPixels(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  const totalMinutes = (hours - START_HOUR) * 60 + minutes;
  return (totalMinutes / 30) * SLOT_HEIGHT;
}

// 起訖時間字串轉像素高度
export function durationToPixels(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const durationMinutes = endH * 60 + endM - (startH * 60 + startM);
  return Math.max((durationMinutes / 30) * SLOT_HEIGHT, SLOT_HEIGHT);
}

// drop 時計算落點的時間
export function pixelsToTime(pixelY: number): string {
  const slotIndex = Math.floor(pixelY / SLOT_HEIGHT);
  const totalMinutes = slotIndex * 30 + START_HOUR * 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// 新任務拖進週曆預設 1 小時
export function getDefaultEndTime(startTime: string): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const endDate = addMinutes(new Date(2000, 0, 1, hours, minutes), 60);
  return `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`;
}

// 產生時間軸列表
export interface TimeSlitMeta {
  hour: number;
  minute: number;
  isHourStart: boolean;
  label: string;
}

export function generateTimeSlots(): TimeSlitMeta[] {
  const slots: TimeSlitMeta[] = [];
  for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
    slots.push({
      hour,
      minute: 0,
      isHourStart: true,
      label: `${String(hour).padStart(2, "0")}:00`,
    });

    if (hour < END_HOUR) {
      slots.push({ hour, minute: 30, isHourStart: false, label: "" });
    }
  }
  return slots;
}

export { isSameDay, isToday, format, parseISO };
