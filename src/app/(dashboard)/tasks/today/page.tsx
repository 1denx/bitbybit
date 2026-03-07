"use client";

import { useEffect } from "react";
import { useCycles } from "@/src/hooks/useCycles";
import { useTasks } from "@/src/hooks/useTasks";
import { useTaskInstances } from "@/src/hooks/useTaskInstance";
import { useUIStore } from "@/src/store/uiStore";
import { TodayView } from "@/src/components/tasks/today/TodayView";
import { calcCycleWeekNumber } from "@/src/hooks/useCurrentWeek";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

export default function TodayPage() {
  const { cycles, fetchCycles } = useCycles();
  const { fetchTaskByCycle } = useTasks();
  const { fetchInstancesByDate } = useTaskInstances();

  const activeCycle =
    cycles.find(cycle => cycle.status === "active") ??
    cycles.find(cycle => cycle.status === "planning") ??
    null;

  const weekNumber = activeCycle ? calcCycleWeekNumber(activeCycle.start_date) : 1;

  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);

  useEffect(() => {
    if (activeCycle) {
      fetchTaskByCycle(activeCycle.id);
      fetchInstancesByDate(activeCycle.id, new Date());
    }
  }, [activeCycle?.id]);

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

  return <TodayView cycleId={activeCycle.id} weekNumber={weekNumber} />;
}
