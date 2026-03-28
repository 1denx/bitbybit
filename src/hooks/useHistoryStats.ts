import { useState, useEffect, useCallback } from "react";
import { createClient } from "../lib/supabase/client";
import { useAuth } from "./useAuth";
import type { Cycle, TaskInstance, Task } from "@/src/types";
import { tr } from "date-fns/locale";

export interface WeekRate {
  weekNumber: number;
  rate: number | null;
}

export interface CycleHistory {
  cycle: Cycle;
  weekRates: WeekRate[];
  avgRate: number | null;
}

export function useHistoryStats(completedCycles: Cycle[]) {
  const supabase = createClient();
  const { user } = useAuth();
  const [histories, setHistories] = useState<CycleHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistories = useCallback(async () => {
    if (!user || completedCycles.length === 0) {
      setHistories([]);
      return;
    }
    setIsLoading(true);
    try {
      const cycleIds = completedCycles.map(cycle => cycle.id);

      //  一次取得所有已完成週期的 instances
      const { data: instances, error: instError } = await supabase
        .from("task_instances")
        .select("task_id, cycle_id, week_number, status")
        .eq("user_id", user.id)
        .in("cycle_id", cycleIds);

      if (instError) throw instError;

      // 一次取所有已完成週期的 tasks (判斷核心/額外)
      const { data: tasks, error: taskError } = await supabase
        .from("tasks")
        .select("id, cycle_id, category")
        .eq("user_id", user.id)
        .in("cycle_id", cycleIds);

      if (taskError) throw taskError;

      // 計算每個週期的統計
      const result: CycleHistory[] = completedCycles.map(cycle => {
        const cycleInstances = (instances ?? []).filter(inst => inst.cycle_id === cycle.id);

        const cycleTasks = (tasks ?? []).filter(task => task.cycle_id === cycle.id);

        const coreTaskIds = new Set(
          cycleTasks.filter(task => task.category === "core").map(task => task.id),
        );

        // 計算 W1-W12 每週達成率
        const weekRates: WeekRate[] = Array.from({ length: 12 }, (_, i) => {
          const weekNumber = i + 1;
          const weekInsts = cycleInstances.filter(
            inst =>
              inst.week_number === weekNumber &&
              coreTaskIds.has(inst.task_id) &&
              inst.status !== "expired",
          );

          if (weekInsts.length === 0) {
            return { weekNumber, rate: null };
          }

          const completed = weekInsts.filter(inst => inst.status === "completed").length;

          return { weekNumber, rate: Math.round((completed / weekInsts.length) * 100) };
        });

        // AVG:只計算有資料的週
        const rateWeeks = weekRates.filter(week => week.rate !== null);
        const avgRate =
          rateWeeks.length > 0
            ? Math.round(rateWeeks.reduce((sum, w) => sum + (w.rate ?? 0), 0) / rateWeeks.length)
            : null;

        return { cycle, weekRates, avgRate };
      });
      setHistories(result);
    } catch (error) {
      console.error("fetchHistories ERROR:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, completedCycles.map(cycle => cycle.id).join(",")]);

  useEffect(() => {
    fetchHistories();
  }, [fetchHistories]);

  return { histories, isLoading };
}
