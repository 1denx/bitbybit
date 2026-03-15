"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/src/lib/utils";
import { FREQUENCY_OPTIONS } from "@/src/lib/utils/priority";
import type { Task } from "@/src/types";

interface MatrixCardProps {
  task: Task;
}

export function MatrixCard({ task }: MatrixCardProps) {
  const { setNodeRef, listeners, attributes, transform, isDragging } = useDraggable({
    id: task.id,
    data: { taskId: task.id, currentPriority: task.priority },
  });

  const frequencyLabel =
    FREQUENCY_OPTIONS.find(opt => opt.value === task.frequency)?.label ?? task.frequency;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "rounded-lg border border-zinc-200 bg-white px-3 py-2.5",
        "cursor-grab active:cursor-grabbing select-none",
        "transition-shadow",
        isDragging && "opacity-0 pointer-events-none",
      )}
    >
      <div className="text-xs font-medium text-zinc-800 truncate">{task.title}</div>
      <div className="flex items-center gap-1.5 mt-1">
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
      </div>
    </div>
  );
}
