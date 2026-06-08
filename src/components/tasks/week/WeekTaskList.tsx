"use client";

import { format, addWeeks } from "date-fns";
import { WeekTaskCard } from "./WeekTaskCard";
import { ExpiredTasksBar } from "./ExpiredTasksBar";
import { useTaskStore } from "@/src/store/taskStore";
import type { Task, TaskInstance } from "@/src/types";

interface WeekTaskListProps {
  tasks: Task[];
  taskInstances: TaskInstance[];
  weekNumber: number;
  onToggleComplete: (instanceId: string) => void;
  onTaskClick?: (instance: TaskInstance) => void;
  onUnscheduledTaskClick?: (task: Task) => void;
}

// 每周次數
function frequencyToCount(frequency: string): number {
  if (frequency === "daily") return 7;
  const num = parseInt(frequency);
  return isNaN(num) ? 1 : num;
}

export function WeekTaskList({
  tasks,
  taskInstances,
  weekNumber,
  onToggleComplete,
  onTaskClick,
  onUnscheduledTaskClick,
}: WeekTaskListProps) {
  const { taskInstances: allInstances } = useTaskStore();
  const todayStr = format(new Date(), "yyyy-MM-dd");

  // 本週應執行的任務
  const thisWeekTasks = tasks.filter(task => task.scheduled_weeks.includes(weekNumber));

  // 本週每個 task 的 instances
  const weekInstanceByTaskId: Record<string, TaskInstance[]> = {};
  taskInstances.forEach(instance => {
    if (instance.status === "scheduled" || instance.status === "completed") {
      if (!weekInstanceByTaskId[instance.task_id]) {
        weekInstanceByTaskId[instance.task_id] = [];
      }
      weekInstanceByTaskId[instance.task_id].push(instance);
    }
  });

  const expiredInstances = allInstances
    .filter(inst => {
      if (inst.week_number !== weekNumber) return false;
      if (inst.status === "expired") return true;
      if (inst.status === "scheduled" && inst.scheduled_date && inst.scheduled_date < todayStr)
        return true;
      return false;
    })
    .filter(inst => {
      if (inst.status !== "expired") return true;
      if (!inst.scheduled_date) return true;
      const movedDate = format(addWeeks(new Date(inst.scheduled_date), 1), "yyyy-MM-dd");
      return !allInstances.some(
        other =>
          other.task_id === inst.task_id &&
          other.scheduled_date === movedDate &&
          other.week_number > weekNumber &&
          other.status === "scheduled",
      );
    });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-zinc-200">
        <h2 className="text-xs font-semibold text-zinc-600">本週任務</h2>
        <p className="text-[10px] text-zinc-400 mt-0.5 hidden md:block">拖曳任務到右側週曆排程</p>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-2.5">
        {thisWeekTasks.length === 0 ? (
          <div className="text-center py-8 text-zinc-400">
            <p className="text-xs">本週沒有任務</p>
          </div>
        ) : (
          thisWeekTasks.map(task => {
            const instances = weekInstanceByTaskId[task.id] ?? [];
            const scheduledCount = instances.length;
            const requireCount = frequencyToCount(task.frequency);

            return (
              <WeekTaskCard
                key={task.id}
                task={task}
                instances={instances}
                scheduledCount={scheduledCount}
                requiredCount={requireCount}
                onToggleComplete={onToggleComplete}
                onTaskClick={onTaskClick}
                onUnscheduledTaskClick={onUnscheduledTaskClick}
              />
            );
          })
        )}
      </div>

      {/* 過期提示 */}
      <ExpiredTasksBar expiredInstances={expiredInstances} />
    </div>
  );
}
