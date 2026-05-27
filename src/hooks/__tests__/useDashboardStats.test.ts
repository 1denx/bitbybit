import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import type { Cycle, Task, TaskInstance } from "../../types";
import { useDashboardStats } from "../useDashboardStats";
import { calcCycleWeekNumber, calcWeekNumberFromDate } from "../useCurrentWeek";
import { create } from "domain";

const { mockCalcCycleWeekNumber } = vi.hoisted(() => ({
  mockCalcCycleWeekNumber: vi.fn().mockReturnValue(3),
}));

vi.mock("../useCurrentWeek", () => ({
  calcCycleWeekNumber: mockCalcCycleWeekNumber,
  calcWeekNumberFromDate: vi.fn(),
}));

const NOW = "2026-05-07";

function makeCycle(overrides: Partial<Cycle> = {}): Cycle {
  return {
    id: "c1",
    user_id: "u1",
    name: "Test Cycle",
    vision: null,
    start_date: "2026-04-20",
    end_date: "2026-07-12",
    status: "active",
    created_at: NOW,
    updated_at: NOW,
    ...overrides,
  };
}

function makeTask(id: string, category: "core" | "extra" = "core", goalId = "g1"): Task {
  return {
    id,
    user_id: "u1",
    goal_id: goalId,
    cycle_id: "c1",
    title: `Task ${id}`,
    category,
    priority: "normal",
    scheduled_weeks: [1, 2, 3],
    frequency: "1",
    note: null,
    create_at: NOW,
    updated_at: NOW,
  };
}

function makeInstance(
  id: string,
  taskId: string,
  weekNumber: number,
  status: TaskInstance["status"],
  scheduledDate: string | null = null,
): TaskInstance {
  return {
    id,
    user_id: "u1",
    task_id: taskId,
    goal_id: "g1",
    cycle_id: "c1",
    week_number: weekNumber,
    scheduled_date: scheduledDate,
    scheduled_start_time: null,
    scheduled_end_time: null,
    status,
    completed_at: null,
    is_expired_auto: false,
    created_at: NOW,
    updated_at: NOW,
  };
}

describe("useDashboardStats", () => {
  describe("activeCycle 為 null (尚未建立週期) ", () => {
    it("所有數字回傳預設值 0 ", () => {
      const { result } = renderHook(() => useDashboardStats(null, [], [], [], NOW, 0));

      expect(result.current.currentWeekNumber).toBe(0);
      expect(result.current.totalWeeks).toBe(12);
      expect(result.current.cycleProgressPercent).toBe(0);
      expect(result.current.totalGoals).toBe(0);
      expect(result.current.activeGoals).toBe(0);
      expect(result.current.coreTaskCompletionRate).toBe(0);
      expect(result.current.weekStats).toHaveLength(0);
      expect(result.current.todayInstances).toHaveLength(0);
    });

    it("reviewCount 仍會帶入到 weeklyReviewCount", () => {
      const { result } = renderHook(() => useDashboardStats(null, [], [], [], NOW, 5));
      expect(result.current.weeklyReviewCount).toBe(5);
    });
  });

  describe("週期進度 (cycleProgressPercent) ", () => {
    it("第 3 週 / 12 = 25%", () => {
      mockCalcCycleWeekNumber.mockReturnValue(3);

      const { result } = renderHook(() => useDashboardStats(makeCycle(), [], [], [], NOW, 0));
      expect(result.current.currentWeekNumber).toBe(3);
      expect(result.current.cycleProgressPercent).toBe(25);
    });

    it("進度最大值為 100% (不會超過) ", () => {
      mockCalcCycleWeekNumber.mockReturnValue(12);
      const { result } = renderHook(() => useDashboardStats(makeCycle(), [], [], [], NOW, 0));
      expect(result.current.cycleProgressPercent).toBe(100);
    });
  });

  describe("核心任務完成率 (coreTaskCompletionTate) ", () => {
    it("只算 category=core 的任務，extra 不計入", () => {
      mockCalcCycleWeekNumber.mockReturnValue(3);
      const coreTask = makeTask("t-core", "core");
      const extraTask = makeTask("t-extra", "extra");
      const instances = [
        makeInstance("i1", "t-core", 1, "completed"),
        makeInstance("i2", "t-extra", 1, "scheduled"),
      ];

      const { result } = renderHook(() =>
        useDashboardStats(makeCycle(), [], [coreTask, extraTask], instances, NOW, 0),
      );

      expect(result.current.coreTaskCompletionRate).toBe(100);
    });

    it("排除當週和未來週，只平均過去週", () => {
      mockCalcCycleWeekNumber.mockReturnValue(3);
      const task = makeTask("t1", "core");
      const instances = [
        makeInstance("i1", "t1", 1, "completed"),
        makeInstance("i2", "t1", 2, "scheduled"),
        makeInstance("i3", "t1", 3, "scheduled"),
        makeInstance("i4", "t1", 4, "scheduled"),
      ];

      const { result } = renderHook(() =>
        useDashboardStats(makeCycle(), [], [task], instances, NOW, 0),
      );
      expect(result.current.coreTaskCompletionRate).toBe(50);
    });

    it("沒有過去週資料時完成率為 0", () => {
      mockCalcCycleWeekNumber.mockReturnValue(1);

      const task = makeTask("t1", "core");
      const instances = [makeInstance("i1", "t1", 1, "scheduled")];

      const { result } = renderHook(() =>
        useDashboardStats(makeCycle(), [], [task], instances, NOW, 0),
      );
      expect(result.current.coreTaskCompletionRate).toBe(0);
    });
  });

  describe("todayInstance (今日任務) ", () => {
    it("只回傳今日且非 expired 的 instances", () => {
      const task = makeTask("t1");
      const instances = [
        makeInstance("i-today", "t1", 3, "scheduled", NOW),
        makeInstance("i-expired", "t1", 3, "expired", NOW),
        makeInstance("i-other-day", "t1", 3, "scheduled", "2026-05-06"),
      ];

      const { result } = renderHook(() =>
        useDashboardStats(makeCycle(), [], [task], instances, NOW, 0),
      );

      expect(result.current.todayInstances).toHaveLength(1);
      expect(result.current.todayInstances[0].id).toBe("i-today");
    });
  });

  describe("目標統計 (goalProgressPercent) ", () => {
    it("有任務的目標視為 activeGoals", () => {
      const goals = [
        {
          id: "g1",
          user_id: "u1",
          cycle_id: "c1",
          title: "Goal 1",
          priority: "main" as const,
          created_at: NOW,
          updated_at: NOW,
        },
        {
          id: "g2",
          user_id: "u1",
          cycle_id: "c1",
          title: "Goal 2",
          priority: "sub" as const,
          created_at: NOW,
          updated_at: NOW,
        },
      ];
      const tasks = [makeTask("t1", "core", "g1")];
      const { result } = renderHook(() => useDashboardStats(makeCycle(), goals, tasks, [], NOW, 0));

      expect(result.current.totalGoals).toBe(2);
      expect(result.current.activeGoals).toBe(1);
      expect(result.current.goalProgressPercent).toBe(50);
    });
  });
});
