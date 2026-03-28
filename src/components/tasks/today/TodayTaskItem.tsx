"use client";

import { cn } from "@/src/lib/utils";
import { PRIORITY_CONFIG } from "@/src/lib/utils/priority";
import { formatTimeStr } from "@/src/lib/utils/calendar";
import type { Task, TaskInstance } from "@/src/types";

interface TodayTaskItemProps {
  task: Task;
  instance: TaskInstance;
  onToggleComplete: (instanceId: string) => void;
}

export function TodayTaskItem({ task, instance, onToggleComplete }: TodayTaskItemProps) {
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const isCompleted = instance.status === "completed";

  const startTime = formatTimeStr(instance.scheduled_start_time);
  const endTime = formatTimeStr(instance.scheduled_end_time);
  const hasScheduledTime = !!startTime && !!endTime;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border border-zinc-200 bg-white",
        "border-l-[3px] transition-all",
        isCompleted && "opacity-50",
        priorityConfig.borderColor,
      )}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={() => onToggleComplete(instance.id)}
        className={cn(
          "w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all cursor-pointer",
          isCompleted ? "bg-zinc-900 border-zinc-900" : "border-zinc-300 hover:border-zinc-600",
        )}
      >
        {isCompleted && <span style={{ fontSize: "10px", color: "#fff", lineHeight: 1 }}>✓</span>}
      </button>

      {/* 內容 */}
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            "text-sm font-medium text-zinc-800 truncate",
            isCompleted && "line-through text-zinc-400",
          )}
        >
          {task.title}
        </div>

        {hasScheduledTime && (
          <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
            {startTime} - {endTime}
          </div>
        )}
      </div>
    </div>
  );
}
