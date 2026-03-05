"use client";

import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { WeekView } from "@/src/components/tasks/week/WeekView";
import { useCycles } from "@/src/hooks/useCycles";
import { useTasks } from "@/src/hooks/useTasks";
import { useTaskInstances } from "@/src/hooks/useTaskInstance";
import { useUIStore } from "@/src/store/uiStore";
import { calcCycleWeekNumber } from "@/src/hooks/useCurrentWeek";
import {
  getWeekDays,
  getThisWeekStart,
  getNextWeekStart,
  getPrevWeekStart,
  formatWeekTitle,
} from "@/src/lib/utils/calendar";
import { startOfWeek, isSameWeek } from "date-fns";

export default function WeekPage() {
  const { cycles, fetchCycles } = useCycles();
  const { fetchTaskByCycle } = useTasks();
  const { fetchInstancesByWeek } = useTaskInstances();
  const { currentWeekStart } = useUIStore();

  const activeCycle =
    cycles.find(cycle => cycle.status === "active") ??
    cycles.find(cycle => cycle.status === "planning") ??
    null;

  const weekNumber = activeCycle ? calcCycleWeekNumber(activeCycle.start_date) : 1;

  const weekDays = getWeekDays(currentWeekStart);
  const isCurrentWeek = isSameWeek(currentWeekStart, new Date(), { weekStartsOn: 1 });

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
    <div className="flex flex-col h-full overflow-hidden">
      {/* WeekView */}
      <WeekView weekDays={weekDays} cycleId={activeCycle.id} weekNumber={weekNumber} />
    </div>
  );
}
