"use client";

import { cn } from "@/src/lib/utils";
import { PRIORITY_CONFIG, FREQUENCY_OPTIONS } from "@/src/lib/utils/priority";
import { formatTimeStr } from "@/src/lib/utils/calendar";
import { format, parseISO } from "date-fns";
import { TriangleAlert } from "lucide-react";
import type { Task, TaskInstance } from "@/src/types";
import { Button } from "../../ui/button";

interface BoardCardProps {
  task: Task;
  instance?: TaskInstance;
  variant?: "default" | "expired" | "completed";
  onToggleComplete?: (instanceId: string) => void;
  onMoveToNextWeek?: (instance: TaskInstance) => void;
}

export function BoardCard({
  task,
  instance,
  variant,
  onToggleComplete,
  onMoveToNextWeek,
}: BoardCardProps) {
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const isCompleted = variant === "completed";
  const isExpired = variant === "expired";

  const frequencyLabel =
    FREQUENCY_OPTIONS.find(opt => opt.value === task.frequency)?.label ?? task.frequency;

  const startTime = formatTimeStr(instance?.scheduled_start_time);
  const endTime = formatTimeStr(instance?.scheduled_end_time);
  const dateLabel = instance?.scheduled_date
    ? format(parseISO(instance.scheduled_date), "M/d (EEE)")
    : null;

  return (
    <div
      className={cn(
        "rounded-lg border border-zinc-200 bg-white p-3",
        "border-l-[3px] transition-all",
        isCompleted && "opacity-55 bg-zinc-50",
        isExpired && priorityConfig.borderColor,
        !isCompleted && !isExpired && priorityConfig.borderColor,
      )}
    >
      {/* 標題列 */}
      <div className="flex items-start gap-2">
        {/* Checkbox (只有 instance 且非過期才顯示) */}
        {instance && !isExpired && onToggleComplete && (
          <button
            type="button"
            onClick={() => onToggleComplete(instance.id)}
            className={cn(
              "w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all cursor-pointer",
              isCompleted ? "bg-zinc-900 border-zinc-900" : "border-zinc-300 hover:border-zinc-600",
            )}
          >
            {isCompleted && (
              <span style={{ fontSize: "10px", color: "#fff", lineHeight: 1 }}>✓</span>
            )}
          </button>
        )}

        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "text-xs font-medium text-zinc-800 truncate",
              isCompleted && "line-through text-zinc-400",
            )}
          >
            {task.title}
          </div>

          {/* Meta: 類別 + 頻率 */}
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-medium hidden sm:block",
                task.category === "core"
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-500 border border-zinc-200",
              )}
            >
              {task.category === "core" ? "核心" : "額外"}
            </span>
            <span className="text-[10px] text-zinc-400 hidden sm:block">{frequencyLabel}</span>
          </div>

          {/* 日期 / 時間 */}
          {(dateLabel || startTime) && (
            <div className="mt-2 flex items-center gap-1.5 text-[9px] font-mono">
              {/* 過期提示 */}
              {isExpired && (
                <span className="mt-0.5 text-[10px] text-rose-600 shrink-0">
                  <TriangleAlert size={12} />
                </span>
              )}
              {dateLabel && (
                <span className={cn(isExpired ? "text-rose-600" : "text-zinc-400")}>
                  {dateLabel}
                </span>
              )}
              {startTime && (
                <span className={cn(isExpired ? "text-rose-600" : "text-zinc-400")}>
                  {startTime}
                  {endTime ? ` – ${endTime}` : ""}
                </span>
              )}
            </div>
          )}

          {/* 過期時顯示移至下週按鈕 */}
          {isExpired && instance && onMoveToNextWeek && (
            <Button
              type="button"
              size="xs"
              variant="outline"
              onClick={() => onMoveToNextWeek(instance)}
              className="mt-2 w-full"
            >
              移到下週
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
