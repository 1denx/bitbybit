"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { PRIORITY_CONFIG } from "@/src/lib/utils/priority";
import { formatTimeStr } from "@/src/lib/utils/calendar";
import type { Task, TaskInstance } from "@/src/types";

interface TodayTaskWidgetProps {
  todayInstances: TaskInstance[];
  taskMap: Record<string, Task>;
}

export function TodayTaskWidget({ todayInstances, taskMap }: TodayTaskWidgetProps) {
  const completedCount = todayInstances.filter(instance => instance.status === "completed").length;

  // 排程時間升序排列
  const sortedInstances = [...todayInstances].sort((instanceA, instanceB) => {
    const timeA = instanceA.scheduled_start_time ?? "99:99";
    const timeB = instanceB.scheduled_start_time ?? "99:99";
    return timeA.localeCompare(timeB);
  });

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-xs font-semibold text-zinc-600">今日待執行任務</span>
          {todayInstances.length > 0 && (
            <span className="text-[10px] text-zinc-400 ml-2">
              {completedCount} / {todayInstances.length} 完成
            </span>
          )}
        </div>
        <Link
          href="/tasks/today"
          className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          前往今日
          <ArrowRight size={11} />
        </Link>
      </div>

      {/* 進度條 */}
      {todayInstances.length > 0 && (
        <div className="h-1 bg-zinc-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-zinc-900 rounded-full transition-all duration-300"
            style={{
              width: `${Math.round((completedCount / todayInstances.length) * 100)}%`,
            }}
          />
        </div>
      )}

      {/* 任務清單 */}
      {todayInstances.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-sm text-zinc-400">今日尚無排程任務</p>
          <Link
            href="/tasks/week"
            className="text-[10px] text-zinc-400 hover:text-zinc-600 underline mt-1 block"
          >
            前往本週視圖排程
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedInstances.slice(0, 5).map(instance => {
            const task = taskMap[instance.task_id];
            if (!task) return null;

            const priorityConfig = PRIORITY_CONFIG[task.priority];
            const isCompleted = instance.status === "completed";
            const startTime = formatTimeStr(instance.scheduled_start_time);
            const endTime = formatTimeStr(instance.scheduled_end_time);

            return (
              <div
                key={instance.id}
                className={cn(
                  "flex items-center gap-3 py-2 px-3 rounded-lg border-l-[2px]",
                  "bg-zinc-50/50 border border-zinc-100",
                  isCompleted && "opacity-50",
                  priorityConfig.borderColor,
                )}
              >
                {/* 狀態圓點 */}
                <div
                  className={cn(
                    "w-3 h-3 rounded-full shrink-0 border-[1.5px]",
                    isCompleted ? "bg-zinc-900 border-zinc-900" : "bg-transparent border-zinc-300",
                  )}
                />

                {/* 任務名稱 */}
                <span
                  className={cn(
                    "flex-1 text-xs text-zinc-700 truncate",
                    isCompleted && "line-through text-zinc-400",
                  )}
                >
                  {task.title}
                </span>

                {/* 時間 */}
                {startTime && (
                  <span className="text-[9px] text-zinc-400 font-mono shrink-0">
                    {startTime}
                    {endTime ? ` – ${endTime}` : ""}
                  </span>
                )}
              </div>
            );
          })}

          {/* 超過 5 個任務時顯示更多 */}
          {todayInstances.length > 5 && (
            <Link
              href="/tasks/today"
              className="block text-center text-[10px] text-zinc-400 hover:text-zinc-600 pt-1"
            >
              還有 {todayInstances.length - 5} 個任務 →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
