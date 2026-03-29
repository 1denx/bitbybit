import { useMemo } from "react";
import { calcCycleWeekNumber } from "./useCurrentWeek";
import type { Cycle, Goal, Task, TaskInstance } from "@/src/types";

export interface WeekStat {
  weekNumber: number;
  completedCount: number;
  scheduledCount: number;
  completionRate: number | null;
  isCurrent: boolean;
  isFuture: boolean;
}

export interface DashboardStats {
  currentWeekNumber: number;
  totalWeeks: number;
  cycleProgressPercent: number;

  totalGoals: number;
  activeGoals: number;
  goalProgressPercent: number;

  coreTaskCompletionRate: number;
  weeklyReviewCount: number;

  weekStats: WeekStat[];
  todayInstances: TaskInstance[];
}

export function useDashboardStats(
  activeCycle: Cycle | null,
  goals: Goal[],
  tasks: Task[],
  taskInstances: TaskInstance[],
  todayDateStr: string,
  reviewCount: number,
): DashboardStats {
  return useMemo(() => {
    if (!activeCycle) {
      return {
        currentWeekNumber: 0,
        totalWeeks: 12,
        cycleProgressPercent: 0,
        totalGoals: 0,
        activeGoals: 0,
        goalProgressPercent: 0,
        coreTaskCompletionRate: 0,
        weeklyReviewCount: reviewCount,
        weekStats: [],
        todayInstances: [],
      };
    }

    const currentWeekNumber = calcCycleWeekNumber(activeCycle.start_date);
    const totalWeeks = 12;

    // 週期進度百分比
    const cycleProgressPercent = Math.min(Math.round((currentWeekNumber / totalWeeks) * 100), 100);

    // 目標統計
    const totalGoals = goals.length;
    // 有目標下有任務的視為 進行中 目標
    const goalTaskIds = new Set(tasks.map(task => task.goal_id));
    const activeGoals = goals.filter(goal => goalTaskIds.has(goal.id)).length;
    const goalProgressPercent = totalGoals > 0 ? Math.round((activeGoals / totalGoals) * 100) : 0;

    // 12 週統計
    const weekStats: WeekStat[] = Array.from({ length: totalWeeks }, (_, index) => {
      const weekNumber = index + 1;
      const isCurrent = weekNumber === currentWeekNumber;
      const isFuture = weekNumber > currentWeekNumber;

      // 這週的所有 instances
      const weekInstances = taskInstances.filter(instance => instance.week_number === weekNumber);

      // 只計算核心任務的 instances
      const coreTaskIds = new Set(
        tasks.filter(task => task.category === "core").map(task => task.id),
      );

      const coreInstances = weekInstances.filter(instance => coreTaskIds.has(instance.task_id));

      const scheduledCount = coreInstances.filter(
        instance => instance.status === "scheduled" || instance.status === "completed",
      ).length;

      const completedCount = coreInstances.filter(
        instance => instance.status === "completed",
      ).length;

      // 未來週 completionRate = null
      const completionRate = isFuture
        ? null
        : scheduledCount > 0
          ? Math.round((completedCount / scheduledCount) * 100)
          : isCurrent
            ? 0
            : null;

      return {
        weekNumber,
        completedCount,
        scheduledCount,
        completionRate,
        isCurrent,
        isFuture,
      };
    });

    // 核心任務平均執行率(只算已完成的週，排除當週和未來週)
    const pastWeekStats = weekStats.filter(
      weekStats => !weekStats.isCurrent && !weekStats.isFuture && weekStats.completionRate !== null,
    );

    const coreTaskCompletionRate =
      pastWeekStats.length > 0
        ? Math.round(
            pastWeekStats.reduce((sum, weekStats) => sum + (weekStats.completionRate ?? 0), 0) /
              pastWeekStats.length,
          )
        : 0;

    // 今日 instances
    const todayInstances = taskInstances.filter(
      instance => instance.scheduled_date === todayDateStr && instance.status !== "expired",
    );

    return {
      currentWeekNumber,
      totalWeeks,
      cycleProgressPercent,
      totalGoals,
      activeGoals,
      goalProgressPercent,
      coreTaskCompletionRate,
      weeklyReviewCount: reviewCount,
      weekStats,
      todayInstances,
    };
  }, [activeCycle, goals, tasks, taskInstances, todayDateStr, reviewCount]);
}
