"use client";

import { WeekTaskCard } from "./WeekTaskCard";
import { ExpiredTasksBar } from "./ExpiredTasksBar";
import { useTaskInstances } from "@/src/hooks/useTaskInstance";
import type { Task, TaskInstance } from "@/src/types";

interface WeekTaskListProps {
  tasks: Task[];
  taskInstances: TaskInstance[];
  weekNumber: number;
  onToggleComplete: (instanceId: string) => void;
}

export function WeekTaskList({
  tasks,
  taskInstances,
  weekNumber,
  onToggleComplete,
}: WeekTaskListProps) {
  const { getExpiredInstances } = useTaskInstances();

  // 本週應執行的任務
  const thisWeekTasks = tasks.filter(task => task.scheduled_weeks.includes(weekNumber));

  // 建立 taskId
  const instanceByTaskId: Record<string, TaskInstance> = {};
  taskInstances.forEach(instance => {
    if (instance.status === "scheduled" || instance.status === "completed") {
      instanceByTaskId[instance.task_id] = instance;
    }
  });

  const expiredInstances = getExpiredInstances();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-zinc-200">
        <h2 className="text-xs font-semibold text-zinc-600">本週任務</h2>
        <p className="text-[10px] text-zinc-400 mt-0.5">拖曳任務到右側週曆排程</p>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-2.5">
        {thisWeekTasks.length === 0 ? (
          <div className="text-center py-8 text-zinc-400">
            <p className="text-xs">本週沒有任務</p>
          </div>
        ) : (
          thisWeekTasks.map(task => (
            <WeekTaskCard
              key={task.id}
              task={task}
              instance={instanceByTaskId[task.id] ?? null}
              onToggleComplete={onToggleComplete}
            />
          ))
        )}
      </div>

      {/* 過期提示 */}
      <ExpiredTasksBar expiredInstances={expiredInstances} />
    </div>
  );
}
