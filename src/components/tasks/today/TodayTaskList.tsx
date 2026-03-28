"use client";

import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { TodayTaskItem } from "./TodayTaskItem";
import type { Task, TaskInstance } from "@/src/types";

interface TodayTaskListProps {
  todayInstances: TaskInstance[];
  taskMap: Record<string, Task>;
  onToggleComplete: (instanceId: string) => void;
}

export function TodayTaskList({ todayInstances, taskMap, onToggleComplete }: TodayTaskListProps) {
  // 依排程時間排序
  const sortedInstances = [...todayInstances].sort((instanceA, instanceB) => {
    const timeA = instanceA.scheduled_start_time ?? "99:99";
    const timeB = instanceB.scheduled_start_time ?? "99:99";
    return timeA.localeCompare(timeB);
  });

  const completedCount = todayInstances.filter(instance => instance.status === "completed").length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200">
        <div className="text-sm font-semibold text-zinc-600">今日待執行</div>

        {/* 完成進度條 */}
        {todayInstances.length > 0 && (
          <div className="mt-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-zinc-400">
                {completedCount} / {todayInstances.length} 完成
              </span>
              <span className="text-[10px] text-zinc-400">
                {Math.round((completedCount / todayInstances.length) * 100)}%
              </span>
            </div>
            <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-900 rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / todayInstances.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 任務列表 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sortedInstances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-xs text-zinc-400">今日沒有排程任務</p>
            <p className="text-[10px] text-zinc-300 mt-1">前往本週視圖拖曳排程</p>
          </div>
        ) : (
          sortedInstances.map(instance => {
            const task = taskMap[instance.task_id];
            if (!task) return null;
            return (
              <TodayTaskItem
                key={instance.id}
                task={task}
                instance={instance}
                onToggleComplete={onToggleComplete}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
