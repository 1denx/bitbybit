import { describe, it, expect } from "vitest";
import {
  getWeekDays,
  getNextWeekStart,
  getPrevWeekStart,
  formatWeekTitle,
  formatTimeStr,
  timeToPixels,
  durationToPixels,
  pixelsToTime,
  getDefaultEndTime,
  SLOT_HEIGHT,
} from "../calendar";
import next from "next";
import { de } from "date-fns/locale";

const MONDAY = new Date("2026-05-04");

describe("getWeekDays", () => {
  it("回傳 7 天", () => {
    expect(getWeekDays(MONDAY)).toHaveLength(7);
  });

  it("第一天是週一 (getDay() === 1) ", () => {
    const days = getWeekDays(MONDAY);
    expect(days[0].getDay()).toBe(1);
  });

  it("最後一天是週日 (getDay() === 0) ", () => {
    const days = getWeekDays(MONDAY);
    expect(days[6].getDay()).toBe(0);
  });

  it("傳入非週一時，自動對其至該週週一", () => {
    const wednesday = new Date("2026-05-06");
    const days = getWeekDays(wednesday);
    expect(days[0].getDay()).toBe(1);
    expect(days).toHaveLength(7);
  });
});

describe("getNextWeekStart", () => {
  it("回傳下一週週一 (+7 天) ", () => {
    const next = getNextWeekStart(MONDAY);
    expect(next.getDate()).toBe(11);
    expect(next.getMonth()).toBe(4);
  });
});

describe("getPrevWeekStart", () => {
  it("回傳上一週週一 (-7 天) ", () => {
    const prev = getPrevWeekStart(MONDAY);
    expect(prev.getDate()).toBe(27);
    expect(prev.getMonth()).toBe(3);
  });
});

describe("formatWeekTitle", () => {
  it('格式化為 "年份 M/d – M/d"', () => {
    expect(formatWeekTitle(MONDAY)).toBe("2026 5/4 – 5/10");
  });

  it("跨月份時頭尾月份不同", () => {
    const lastWeekOfApril = new Date("2026-04-27");
    expect(formatWeekTitle(lastWeekOfApril)).toBe("2026 4/27 – 5/3");
  });
});

describe("formatTimeStr", () => {
  it('"HH:mm:ss" -> "HH:mm"', () => {
    expect(formatTimeStr("09:30:00")).toBe("09:30");
  });

  it("null -> 空字串", () => {
    expect(formatTimeStr(null)).toBe("");
  });

  it("undefined -> 空字串", () => {
    expect(formatTimeStr(undefined)).toBe("");
  });
});

describe("timeToPixels", () => {
  it("06:00 (START_HOUR) -> 0 像素", () => {
    expect(timeToPixels("06:00:00")).toBe(0);
  });

  it("06:30 (半小時 = 1格) -> SLOT_HEIGHT 像素", () => {
    expect(timeToPixels("06:30:00")).toBe(SLOT_HEIGHT);
  });

  it("07:00 (1 小時 = 2 格) -> SLOT_HEIGHT * 2 像素", () => {
    expect(timeToPixels("07:00:00")).toBe(SLOT_HEIGHT * 2);
  });

  it("09:00 (3 小時 = 6 格) -> SLOT_HEIGHT * 6 像素", () => {
    expect(timeToPixels("09:00:00")).toBe(SLOT_HEIGHT * 6);
  });
});

describe("durationToPixels", () => {
  it("1 小時 -> SLOT_HEIGHT * 2", () => {
    expect(durationToPixels("09:00:00", "10:00:00")).toBe(SLOT_HEIGHT * 2);
  });

  it("1.5 小時 -> SLOT_HEIGHT * 3", () => {
    expect(durationToPixels("09:00:00", "10:30:00")).toBe(SLOT_HEIGHT * 3);
  });

  it("時長為 0 -> 回傳最小值 SLOT_HEIGHT (不會變成 0 高度) ", () => {
    expect(durationToPixels("09:00:00", "09:00:00")).toBe(SLOT_HEIGHT);
  });
});

describe("pixelsToTime", () => {
  it("0 像素 -> '06:00' (START_HOUR) ", () => {
    expect(pixelsToTime(0)).toBe("06:00");
  });

  it("SLOT_HEIGHT 像素 -> '06:30' (半小時) ", () => {
    expect(pixelsToTime(SLOT_HEIGHT)).toBe("06:30");
  });

  it("SLOT_EIGHT * 2 像素 -> '07:00'", () => {
    expect(pixelsToTime(SLOT_HEIGHT * 2)).toBe("07:00");
  });

  it("timeToPixels -> pixelsToTime 可還原", () => {
    const time = "10:30:00";
    const px = timeToPixels(time);
    expect(pixelsToTime(px)).toBe("10:30");
  });
});

describe("getDefaultEndTime", () => {
  it("開始時間 + 1 小時", () => {
    expect(getDefaultEndTime("09:00")).toBe("10:00");
  });

  it("帶秒數格式也可以正確計算", () => {
    expect(getDefaultEndTime("14:30:00")).toBe("15:30");
  });
});
