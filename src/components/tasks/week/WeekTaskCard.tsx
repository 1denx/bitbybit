"use client";

import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/src/lib/utils";
import { PRIORITY_CONFIG, FREQUENCY_OPTIONS } from "@/src/lib/utils/priority";
import type { Task, TaskInstance } from "@/src/types";

interface WeekTaskCardProps {
  task: Task;
  instances: TaskInstance[];
  scheduledCount: number;
  requiredCount: number;
  onToggleComplete?: (instanceId: string) => void;
}

function formatTime(time: string | null): string {
  if (!time) return "";
  return time.slice(0, 5);
}

export function WeekTaskCard({
  task,
  instances,
  scheduledCount,
  requiredCount,
  onToggleComplete,
}: WeekTaskCardProps) {
  const isAllScheduled = scheduledCount >= requiredCount;
  const completedCount = instances.filter(inst => inst.status === "completed").length;

  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const frequencyLabel =
    FREQUENCY_OPTIONS.find(option => option.value === task.frequency)?.label ?? task.frequency;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: {
      type: "task",
      taskId: task.id,
      goalId: task.goal_id,
      instanceId: null,
    },
    disabled: completedCount >= requiredCount,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "rounded-lg border border-zinc-100 bg-white p-2.5 mb-2",
        "border-l-[3px] cursor-grab active:cursor-grabbing",
        "transition-all select-none",
        isDragging && "opacity-0 pointer-events-none",
        isAllScheduled && "opacity-50",
        priorityConfig.borderColor,
      )}
    >
      {/* 名稱 */}
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "text-sm font-medium text-zinc-800 truncate",
              isAllScheduled && completedCount >= requiredCount && "line-through text-zinc-400",
            )}
          >
            {task.title}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                task.category === "core"
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-500 border border-zinc-200",
              )}
            >
              {task.category === "core" ? "核心" : "額外"}
            </span>
            <span className="text-[10px] text-zinc-400">{frequencyLabel}</span>
          </div>
        </div>
      </div>

      {/* 排程進度 */}
      <div className="mt-2 flex items-center justify-between">
        {/* 進度條 */}
        <div className="flex gap-0.5 flex-1">
          {Array.from({ length: requiredCount }, (_, i) => {
            const instance = instances[i];
            const isCompleted = instance?.status === "completed";
            const isScheduled = !!instance;

            return (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  isCompleted ? "bg-zinc-900" : isScheduled ? "bg-zinc-400" : "bg-zinc-200",
                )}
              />
            );
          })}
        </div>

        {/* 次數 */}
        <span
          className={cn(
            "ml-2 text-[10px] shrink-0",
            isAllScheduled ? "text-zinc-400" : "text-zinc-500",
          )}
        >
          {scheduledCount}/{requiredCount}
        </span>
      </div>

      {/* 各 instance 的時間 */}
      {instances.length > 0 && (
        <div className="mt-1.5 space-y-0.5">
          {instances.map(inst => (
            <div key={inst.id} className="flex items-center gap-1.5">
              {/* 勾選 */}
              <button
                type="button"
                onMouseDown={e => e.stopPropagation()}
                onClick={e => {
                  e.stopPropagation();
                  onToggleComplete?.(inst.id);
                }}
                className={cn(
                  "w-3 h-3 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all",
                  inst.status === "completed"
                    ? "bg-zinc-900 border-zinc-900"
                    : "border-zinc-300 hover:border-zinc-500",
                )}
              >
                {inst.status === "completed" && (
                  <span style={{ fontSize: "7px", color: "#fff", lineHeight: 1 }}>✓</span>
                )}
              </button>

              <span
                className={cn(
                  "text-[9px] text-zinc-400",
                  inst.status === "completed" && "line-through opacity-60",
                )}
              >
                {inst.scheduled_date?.slice(5).replace("-", "/")}｜
                {formatTime(inst.scheduled_start_time)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
