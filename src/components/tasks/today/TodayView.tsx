"use client";

import { TodayTaskList } from "./TodayTaskList";
import { TodayColumns } from "./TodayColumns";
import { useTaskInstances } from "@/src/hooks/useTaskInstance";
import { useTaskStore } from "@/src/store/taskStore";
import { format } from "date-fns";
import type { Task } from "@/src/types";

interface TodayViewProps {
  cycleId: string;
  weekNumber: number;
}

export function TodayView({ cycleId, weekNumber }: TodayViewProps) {
  const { tasks, taskInstances } = useTaskStore();
  const { completeInstance, uncompleteInstance } = useTaskInstances();

  // 建立 taskId
  const taskMap: Record<string, Task> = {};
  tasks.forEach(task => {
    taskMap[task.id] = task;
  });

  // 今日的 instances
  const todayDateStr = format(new Date(), "yyyy-MM-dd");
  const todayInstances = taskInstances.filter(
    instance => instance.scheduled_date === todayDateStr && instance.status !== "expired",
  );

  const handleToggleComplete = async (instanceId: string) => {
    const instance = taskInstances.find(inst => inst.id === instanceId);
    if (!instance) return;

    if (instance.status === "completed") {
      await uncompleteInstance(instanceId);
    } else {
      await completeInstance(instanceId);
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* 左側:待執行清單 */}
      <div className="w-80 shrink-0 border-r border-zinc-200">
        <TodayTaskList
          todayInstances={todayInstances}
          taskMap={taskMap}
          onToggleComplete={handleToggleComplete}
        />
      </div>

      {/* 右側:三欄 */}
      <TodayColumns
        todayInstances={todayInstances}
        allTasks={tasks}
        taskMap={taskMap}
        weekNumber={weekNumber}
        onToggleComplete={handleToggleComplete}
      />
    </div>
  );
}
