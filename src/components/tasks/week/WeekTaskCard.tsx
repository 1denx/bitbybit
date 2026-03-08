"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/src/lib/utils";
import { PRIORITY_CONFIG, FREQUENCY_OPTIONS } from "@/src/lib/utils/priority";
import type { Task, TaskInstance } from "@/src/types";

interface WeekTaskCardProps {
  task: Task;
  instance: TaskInstance | null;
  onToggleComplete?: (instanceId: string) => void;
}

function formatTime(time: string | null): string {
  if (!time) return "";
  return time.slice(0, 5);
}

export function WeekTaskCard({ task, instance, onToggleComplete }: WeekTaskCardProps) {
  const isScheduled = !!instance;
  const isCompleted = instance?.status === "completed";
  const priorityConfig = PRIORITY_CONFIG[task.priority];

  const frequencyLabel =
    FREQUENCY_OPTIONS.find(option => option.value === task.frequency)?.label ?? task.frequency;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: {
      type: "task",
      taskId: task.id,
      goalId: task.goal_id,
      instanceId: instance?.id ?? null,
    },
    disabled: isCompleted,
  });

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (instance && onToggleComplete) {
      onToggleComplete(instance.id);
    }
  };

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
        isScheduled && !isCompleted && "opacity-50",
        isCompleted && "opacity-40",
        priorityConfig.borderColor,
      )}
    >
      {/* 上方:checkbox + 名稱 */}
      <div className="flex items-start gap-2">
        {/* checkbox */}
        {isScheduled && (
          <button
            type="button"
            onClick={handleCheckboxClick}
            className={cn(
              "mt-0.5 w-3.5 h-3.5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all",
              isCompleted ? "bg-zinc-900 border-zinc-900" : "border-zinc-300 hover:border-zinc-500",
            )}
          >
            {isCompleted && (
              <span style={{ fontSize: "8px", color: "#fff", lineHeight: 1 }}>✓</span>
            )}
          </button>
        )}

        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "text-sm font-medium text-zinc-800 truncate",
              isCompleted && "line-through text-zinc-400",
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

      {/* 已排程提示 */}
      {isScheduled && !isCompleted && (
        <div className="mt-1.5 text-[10px] text-zinc-400 font-mono">
          {formatTime(instance.scheduled_start_time)} - {formatTime(instance.scheduled_end_time)}
        </div>
      )}
    </div>
  );
}
