"use client";

import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/src/lib/utils";
import { MatrixCard } from "./MatrixCard";
import type { Task, TaskPriority } from "@/src/types";

interface QuadrantConfig {
  title: string;
  dotColor: string;
  titleColor: string;
}

const QUADRANT_CONFIG: Record<TaskPriority, QuadrantConfig> = {
  urgent_important: {
    title: "緊急且重要",
    dotColor: "bg-rose-400",
    titleColor: "text-rose-500",
  },
  important: {
    title: "重要但不緊急",
    dotColor: "bg-amber-400",
    titleColor: "text-amber-500",
  },
  urgent: {
    title: "緊急但不重要",
    dotColor: "bg-sky-400",
    titleColor: "text-sky-500",
  },
  normal: {
    title: "不緊急且不重要",
    dotColor: "bg-zinc-400",
    titleColor: "text-zinc-500",
  },
};

interface MatrixQuadrantProps {
  priority: TaskPriority;
  tasks: Task[];
}

export function MatrixQuadrant({ priority, tasks }: MatrixQuadrantProps) {
  const config = QUADRANT_CONFIG[priority];
  const { setNodeRef, isOver } = useDroppable({
    id: `quadrant-${priority}`,
    data: { priority },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-xl border p-3 min-h-0 transition-colors",
        isOver && "right-2 right-zinc-400 ring-offset-1",
      )}
    >
      {/* 象限標題 */}
      <div className="flex items-center gap-2 mb-3 shrink-0">
        <div className={cn("w-2 h-2 rounded-full shrink-0", config.dotColor)} />
        <span className={cn("text-xs font-medium text-zinc-600", config.titleColor)}>
          {config.title}
        </span>
        <span className="ml-auto text-xs text-zinc-400">{tasks.length}</span>
      </div>

      {/* 任務卡片 */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {tasks.length === 0 ? (
          <div
            className={cn(
              "rounded-lg border border-dashed p-4 text-center transition-colors",
              isOver ? "border-zinc-400 bg-zinc-50" : "border-zinc-200",
            )}
          >
            <p className="text-[10px] text-zinc-400">拖曳任務到此</p>
          </div>
        ) : (
          tasks.map(task => <MatrixCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}
