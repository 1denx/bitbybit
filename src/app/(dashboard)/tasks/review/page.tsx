"use client";

import { useEffect } from "react";
import { format, startOfWeek } from "date-fns";
import { useCycles } from "@/src/hooks/useCycles";
import { useTasks } from "@/src/hooks/useTasks";
import { useTaskInstances } from "@/src/hooks/useTaskInstance";
import { calcCycleWeekNumber } from "@/src/hooks/useCurrentWeek";
import { ReviewView } from "@/src/components/tasks/review/ReviewView";
import { useUIStore } from "@/src/store/uiStore";

export default function ReviewPage() {
  const { cycles, fetchCycles } = useCycles();
  const { fetchTaskByCycle } = useTasks();
  const { fetchInstancesByWeek } = useTaskInstances();
  const { currentWeekStart } = useUIStore();

  const activeCycle =
    cycles.find(cycle => cycle.status === "active") ??
    cycles.find(cycle => cycle.status === "planning") ??
    null;

  const weekNumber = activeCycle ? calcCycleWeekNumber(activeCycle.start_date) : 1;

  // 本週週一的日期
  const weekStart = startOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const weekStartDate = format(weekStart, "yyyy-MM-dd");

  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);

  useEffect(() => {
    if (activeCycle) {
      fetchTaskByCycle(activeCycle.id);
      fetchInstancesByWeek(activeCycle.id, weekNumber);
    }
  }, [activeCycle?.id, weekNumber]);

  if (!activeCycle) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400">
        <div className="text-center">
          <p className="text-sm">尚無進行中的週期</p>
          <p className="text-xs mt-1">請先至週期管理建立並開始執行</p>
        </div>
      </div>
    );
  }

  return (
    <ReviewView cycleId={activeCycle.id} weekNumber={weekNumber} weekStartDate={weekStartDate} />
  );
}
