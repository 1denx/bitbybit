"use client";

import { useMemo } from "react";
import { format, parseISO, addDays, getDay, add } from "date-fns";
import { ReviewStatsGrid } from "./ReviewStatsGrid";
import { DailyTrendChart } from "./DailyTrendChart";
import { ReviewForm } from "./ReviewForm";
import { useWeekReview } from "@/src/hooks/useWeekReview";
import { useTaskStore } from "@/src/store/taskStore";

interface ReviewViewProps {
  cycleId: string;
  weekNumber: number;
  weekStartDate: string;
}

export function ReviewView({ cycleId, weekNumber, weekStartDate }: ReviewViewProps) {
  const { tasks, taskInstances } = useTaskStore();
  const { review, isLoading, isSaving, saveReview } = useWeekReview(cycleId, weekNumber);

  const todayStr = format(new Date(), "yyyy-MM-dd");

  // 本週結束日(週日)
  const weekEndStr = format(addDays(parseISO(weekStartDate), 6), "yyyy-MM-dd");

  // 過去週、當週開放，未來週鎖定
  const isFutureWeek = weekEndStr > todayStr;
  const isCurrentWeek = weekStartDate <= todayStr && todayStr <= weekEndStr;
  const todayDate = new Date();
  const isLocked = isFutureWeek || (isCurrentWeek && getDay(todayDate) !== 0);

  // 本週 instance
  const weekInstances = taskInstances.filter(inst => inst.week_number === weekNumber);

  // 統計計算
  const stats = useMemo(() => {
    const coreTaskIds = new Set(
      tasks.filter(task => task.category === "core").map(task => task.id),
    );

    const relevantInstances = weekInstances.filter(
      inst => inst.status === "completed" || inst.status === "scheduled",
    );

    const totalCount = relevantInstances.length;
    const completedCount = relevantInstances.filter(inst => inst.status === "completed").length;
    const pendingCount = totalCount - completedCount;

    // 核心任務
    const coreInstances = relevantInstances.filter(inst => coreTaskIds.has(inst.task_id));
    const coreCompleted = coreInstances.filter(inst => inst.status === "completed").length;
    const corePending = coreInstances.length - coreCompleted;

    // 額外任務
    const extraInstances = relevantInstances.filter(inst => !coreTaskIds.has(inst.task_id));
    const extraCompleted = extraInstances.filter(inst => inst.status === "completed").length;
    const extraPending = extraInstances.length - extraCompleted;

    const coreCompletionRate =
      coreInstances.length > 0 ? Math.round((coreCompleted / coreInstances.length) * 100) : 0;

    return {
      totalCount,
      completedCount,
      pendingCount,
      coreCompletionRate,
      // 細分數字
      totalCore: coreInstances.length,
      totalExtra: extraInstances.length,
      completedCore: coreCompleted,
      completedExtra: extraCompleted,
      pendingCore: corePending,
      pendingExtra: extraPending,
    };
  }, [weekInstances, tasks]);

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4">
      {/* 統計四格 */}
      <ReviewStatsGrid stats={stats} />

      {/* 每日趨勢圖 */}
      <DailyTrendChart
        weekInstances={weekInstances}
        tasks={tasks}
        weekStartDate={weekStartDate}
        todayStr={todayStr}
      />

      {/* 回顧表單 */}
      <ReviewForm
        review={review}
        isLocked={isLocked}
        isLoading={isLoading}
        isSaving={isSaving}
        weekNumber={weekNumber}
        weekEndDate={weekEndStr}
        onSave={saveReview}
      />
    </div>
  );
}
