"use client";

import { useEffect, useState } from "react";
import { Plus, RefreshCcw, AlertCircle } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { GoalCard } from "@/src/components/goals/GoalCard";
import { GoalModal } from "@/src/components/modals/GoalModal";
import { QuickAddTaskModal } from "@/src/components/modals/QuickAddTaskModal";
import { useGoals } from "@/src/hooks/useGoals";
import { useTasks } from "@/src/hooks/useTasks";
import { useCycles } from "@/src/hooks/useCycles";
import type { Goal } from "@/src/types";

export default function GoalsPage() {
  const { cycles, fetchCycles } = useCycles();
  const { goals, isLoading, fetchGoalsByCycle } = useGoals();
  const { fetchTasksByGoal, getTasksByGoal } = useTasks();

  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editTargetGoal, setEditTargetGoal] = useState<Goal | null>(null);
  const [quickAddGoalId, setQuickAddGoal] = useState<string | null>(null);

  // 取得進行中的週期
  const activeCycle =
    cycles.find(cycle => cycle.status === "active") ??
    cycles.find(cycle => cycle.status === "planning") ??
    null;

  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);

  useEffect(() => {
    if (activeCycle) {
      fetchGoalsByCycle(activeCycle.id);
      fetchTasksByGoal(activeCycle.id);
    }
  }, [activeCycle?.id]);

  const handleEditGoal = (goal: Goal) => {
    setEditTargetGoal(goal);
    setGoalModalOpen(true);
  };

  const handleCloseGoalModal = () => {
    setGoalModalOpen(false);
    setEditTargetGoal(null);
  };

  const handleAddTask = (goalId: string) => {
    setQuickAddGoal(goalId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* TopBar */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-sm lg:text-xl font-semibold text-zinc-900">目標管理</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            {activeCycle
              ? `${activeCycle.name} · ${
                  activeCycle.status === "planning"
                    ? "規劃中"
                    : `W${String(cycles.indexOf(activeCycle) + 1)}`
                }`
              : "尚無週期"}
          </p>
        </div>
        {activeCycle && (
          <Button onClick={() => setGoalModalOpen(true)} className="flex items-center">
            <Plus size={14} className="lg:mr-1" />
            <span className="hidden lg:block">新增目標</span>
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* 載入中 */}
        {isLoading && (
          <div className="flex items-center justify-center py-20 text-zinc-400">
            <RefreshCcw size={16} className="animate-spin mr-2" />
            載入中...
          </div>
        )}

        {/* 沒有進行中的週期 */}
        {!isLoading && !activeCycle && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle size={32} className="text-zinc-300 mb-3" />
            <h3 className="font-semibold text-zinc-300 mb-3">沒有進行中的週期</h3>
            <p className="text-sm text-zinc-400">請先至週期管理建立並開始執行一個週期</p>
          </div>
        )}

        {/* 空狀態:有週期但沒目標 */}
        {!isLoading && activeCycle && goals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h3 className="font-semibold text-zinc-700 mb-1">還沒有任何目標</h3>
            <p className="text-sm text-zinc-400 mb-6">為這個週期新增你想達成的目標吧</p>
            <Button onClick={() => setGoalModalOpen(true)}>新增第一個目標</Button>
          </div>
        )}

        {/* 目標列表 */}
        {!isLoading && activeCycle && goals.length > 0 && (
          <div className="flex flex-col gap-4 max-w-2xl">
            {goals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                tasks={getTasksByGoal(goal.id)}
                cycleId={activeCycle.id}
                onEdit={handleEditGoal}
                onAddTask={handleAddTask}
              />
            ))}
          </div>
        )}
      </div>

      {/* GoalModal */}
      {activeCycle && (
        <GoalModal
          open={goalModalOpen}
          onClose={handleCloseGoalModal}
          cycleId={activeCycle.id}
          editTarget={editTargetGoal}
        />
      )}

      {/* QuickAddTaskModal */}
      {activeCycle && quickAddGoalId && (
        <QuickAddTaskModal
          open={!!quickAddGoalId}
          onClose={() => setQuickAddGoal(null)}
          goalId={quickAddGoalId}
          cycleId={activeCycle.id}
        />
      )}
    </div>
  );
}
