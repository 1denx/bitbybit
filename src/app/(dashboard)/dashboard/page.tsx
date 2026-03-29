"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { useAuth } from "@/src/hooks/useAuth";
import { format } from "date-fns";
import { VisionCard } from "@/src/components/dashboard/VisionCard";
import { StatsGrid } from "@/src/components/dashboard/StatsGrid";
import { TrendChart } from "@/src/components/dashboard/TrendChart";
import { TodayTaskWidget } from "@/src/components/dashboard/TodayTaskWidget";
import { EmptyDashboard } from "@/src/components/dashboard/EmptyDashboard";
import { useCycles } from "@/src/hooks/useCycles";
import { useGoals } from "@/src/hooks/useGoals";
import { useTasks } from "@/src/hooks/useTasks";
import { useTaskInstances } from "@/src/hooks/useTaskInstance";
import { useTaskStore } from "@/src/store/taskStore";
import { useGoalStore } from "@/src/store/goalStore";
import { useDashboardStats } from "@/src/hooks/useDashboardStats";
import type { Task } from "@/src/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [reviewCount, setReviewCount] = useState(0);
  const { cycles, fetchCycles } = useCycles();
  const { fetchGoalsByCycle } = useGoals();
  const { fetchTaskByCycle } = useTasks();
  const { fetchAllInstancesByCycle } = useTaskInstances();

  const { tasks, taskInstances } = useTaskStore();
  const { goals } = useGoalStore();

  const activeCycle =
    cycles.find(cycle => cycle.status === "active") ??
    cycles.find(cycle => cycle.status === "planning") ??
    null;

  const todayDateStr = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);

  useEffect(() => {
    if (activeCycle) {
      fetchGoalsByCycle(activeCycle.id);
      fetchTaskByCycle(activeCycle.id);
      fetchAllInstancesByCycle(activeCycle.id);
    }
  }, [activeCycle?.id]);

  useEffect(() => {
    if (!activeCycle || !user) return;
    const fetchReviewCount = async () => {
      const supabase = createClient();
      const { count } = await supabase
        .from("week_reviews")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("cycle_id", activeCycle.id);
      setReviewCount(count ?? 0);
    };
    fetchReviewCount();
  }, [activeCycle?.id, user]);

  // 建立 taskId
  const taskMap: Record<string, Task> = {};
  tasks.forEach(task => {
    taskMap[task.id] = task;
  });

  const stats = useDashboardStats(
    activeCycle,
    goals,
    tasks,
    taskInstances,
    todayDateStr,
    reviewCount,
  );

  if (!activeCycle) {
    return <EmptyDashboard />;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* TopBar */}
      <div className="flex items-center gap-3 border-b px-6 py-3 bg-white shrink-0">
        <h1 className="text-xl font-semibold text-zinc-900">儀表板</h1>
      </div>

      {/* 內容 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* 願景內容 */}
        <VisionCard cycle={activeCycle} currentWeekNumber={stats.currentWeekNumber} />

        {/* 四格統計 */}
        <StatsGrid stats={stats} />

        {/* 趨勢圖 + 今日任務 */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <TrendChart weekStats={stats.weekStats} currentWeekNumber={stats.currentWeekNumber} />
          </div>
          <div>
            <TodayTaskWidget todayInstances={stats.todayInstances} taskMap={taskMap} />
          </div>
        </div>
      </div>
    </div>
  );
}
