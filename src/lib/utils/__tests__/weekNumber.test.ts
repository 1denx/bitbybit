import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { calcEndDate, getCurrentWeekNumber, formatDate, formatDateRange } from "../weekNumber";

describe("calcEndDate", () => {
  it("週期結束日 = 開始日 + 83 天 (12週 * 7天 -1)", () => {
    const start = new Date("2026-01-01");
    const end = calcEndDate(start);

    expect(end.getFullYear()).toBe(2026);
    expect(end.getMonth()).toBe(2);
    expect(end.getDate()).toBe(25);
  });
});

describe("getCurrentWeekNumber", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("週期第 1 天 (diff=0) -> 第 1 週", () => {
    vi.setSystemTime(new Date("2026-05-07"));
    expect(getCurrentWeekNumber("2026-05-07")).toBe(1);
  });

  it("週期第 7 天 (diff=6) -> 仍是第 1 週", () => {
    vi.setSystemTime(new Date("2026-05-13"));
    expect(getCurrentWeekNumber("2026-05-07")).toBe(1);
  });

  it("週期第 8 天 (diff=7) -> 進入第 2 週", () => {
    vi.setSystemTime(new Date("2026-05-14"));
    expect(getCurrentWeekNumber("2026-05-07")).toBe(2);
  });

  it("週期最後一天 (diff=83) -> 第 12 週", () => {
    vi.setSystemTime(new Date("2026-07-29"));
    expect(getCurrentWeekNumber("2026-05-07")).toBe(12);
  });

  it("超出週期 (diff=84) -> null", () => {
    vi.setSystemTime(new Date("2026-07-30"));
    expect(getCurrentWeekNumber("2026-05-07")).toBeNull();
  });

  it("今天在週期開始之前 (diff<0) -> null", () => {
    vi.setSystemTime(new Date("2026-05-06"));
    expect(getCurrentWeekNumber("2026-05-07")).toBeNull();
  });
});

describe("formatDate", () => {
  it('格式化為 "yyyy/MM/dd"', () => {
    expect(formatDate("2026-05-07")).toBe("2026/05/07");
  });

  it("月份和日期補零", () => {
    expect(formatDate("2026-01-05")).toBe("2026/01/05");
  });
});

describe("formatDateRange", () => {
  it('格式化為 "yyyy/MM/dd - MM/dd" (結束日只有 月/日)', () => {
    expect(formatDateRange("2026-05-07", "2026-07-29")).toBe("2026/05/07 - 07/29");
  });
});
