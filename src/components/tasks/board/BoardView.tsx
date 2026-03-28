"use client";

import { useMemo } from "react";
import { format, parseISO, isBefore, startOfDay } from "date-fns";
import { BoardColumn } from "./BoardColumn";
import { useTaskInstances } from "@/src/hooks/useTaskInstance";
import { useTaskStore } from "@/src/store/taskStore";
import type { Task, TaskInstance } from "@/src/types";

interface BoardViewProps {
  cycleId: string;
  weekNumber: number;
}

export function BoardView({ cycleId, weekNumber }: BoardViewProps) {
  const { tasks, taskInstances } = useTaskStore();
  const { completeInstance, uncompleteInstance } = useTaskInstances();

  const today = startOfDay(new Date());
  const todayStr = format(today, "yyyy-MM-dd");

  // 本週所有 instances
  const weekInstances = taskInstances.filter(inst => inst.week_number === weekNumber);

  // task.id -> instances[]
  const instancesByTask = useMemo(() => {
    const map: Record<string, TaskInstance[]> = {};
    weekInstances.forEach(inst => {
      if (!map[inst.task_id]) map[inst.task_id] = [];
      map[inst.task_id].push(inst);
    });
    return map;
  }, [weekInstances]);

  // 本週應執行的任務
  const weekTasks = tasks.filter(task => task.scheduled_weeks.includes(weekNumber));

  // 四欄分類
  // 未排程: 本週沒有任何 instance 的任務
  const unscheduledItems = weekTasks
    .filter(task => !instancesByTask[task.id]?.length)
    .map(task => ({ task }));

  // 已過期: instance.status = "expired" 或 scheduled_date < today 且 status = "scheduled"
  const expiredItems: { task: Task; instance: TaskInstance }[] = [];
  weekInstances
    .filter(inst => {
      if (inst.status === "expired") return true;
      if (inst.status === "scheduled" && inst.scheduled_date && inst.scheduled_date < todayStr)
        return true;
      return false;
    })
    .forEach(inst => {
      const task = tasks.find(t => t.id === inst.task_id);
      if (task) expiredItems.push({ task, instance: inst });
    });

  // 進行中: scheduled_date >= today 且 status = "scheduled"
  const inProgressItems: { task: Task; instance: TaskInstance }[] = [];
  weekInstances
    .filter(
      inst => inst.status === "scheduled" && inst.scheduled_date && inst.scheduled_date >= todayStr,
    )
    .sort((a, b) => {
      // 今天的排在最前，再依時間排序
      const dateA = a.scheduled_date!;
      const dateB = b.scheduled_date!;
      if (dateA !== dateB) {
        return dateA < dateB ? -1 : 1;
      }
      return (a.scheduled_start_time ?? "") < (b.scheduled_start_time ?? "") ? -1 : 1;
    })
    .forEach(inst => {
      const task = tasks.find(t => t.id === inst.task_id);
      if (task) inProgressItems.push({ task, instance: inst });
    });

  // 已完成: status = "completed" 依完成日期降序
  const completedItems: { task: Task; instance: TaskInstance }[] = [];
  weekInstances
    .filter(inst => inst.status === "completed")
    .sort((a, b) => ((b.scheduled_date ?? "") > (a.scheduled_date ?? "") ? 1 : -1))
    .forEach(inst => {
      const task = tasks.find(t => t.id === inst.task_id);
      if (task) completedItems.push({ task, instance: inst });
    });

  const handleToggleComplete = async (instanceId: string) => {
    const inst = taskInstances.find(i => i.id === instanceId);
    if (!inst) return;
    if (inst.status === "completed") {
      await uncompleteInstance(instanceId);
    } else {
      await completeInstance(instanceId);
    }
  };

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 h-full overflow-hidden p-4 gap-4">
      <BoardColumn
        type="unscheduled"
        items={unscheduledItems}
        onToggleComplete={handleToggleComplete}
      />
      <BoardColumn type="expired" items={expiredItems} onToggleComplete={handleToggleComplete} />
      <BoardColumn
        type="in_progress"
        items={inProgressItems}
        onToggleComplete={handleToggleComplete}
      />
      <BoardColumn
        type="completed"
        items={completedItems}
        onToggleComplete={handleToggleComplete}
      />
    </div>
  );
}
