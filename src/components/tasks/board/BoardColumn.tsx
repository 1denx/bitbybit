"use client";

import { cn } from "@/src/lib/utils";
import { BoardCard } from "./BoardCard";
import type { Task, TaskInstance } from "@/src/types";

type ColumnType = "unscheduled" | "expired" | "in_progress" | "completed";

interface BoardColumnItem {
  task: Task;
  instance?: TaskInstance;
}

interface BoardColumnProps {
  type: ColumnType;
  items: BoardColumnItem[];
  onToggleComplete?: (instanceId: string) => void;
  onMoveToNextWeek?: (instance: TaskInstance) => void;
}

const COLUMN_CONFIG: Record<
  ColumnType,
  {
    title: string;
    countBg: string;
    countText: string;
  }
> = {
  unscheduled: {
    title: "未排程",
    countBg: "bg-zinc-200",
    countText: "text-zinc-500",
  },
  expired: {
    title: "已過期",
    countBg: "bg-rose-100",
    countText: "text-rose-600",
  },
  in_progress: {
    title: "進行中",
    countBg: "bg-sky-100",
    countText: "text-sky-600",
  },
  completed: {
    title: "已完成",
    countBg: "bg-emerald-100",
    countText: "text-emerald-600",
  },
};

export function BoardColumn({ type, items, onToggleComplete, onMoveToNextWeek }: BoardColumnProps) {
  const config = COLUMN_CONFIG[type];

  return (
    <div className={cn("flex flex-col w-full rounded-xl border min-h-0")}>
      {/* 欄標題 */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-200 shrink-0">
        <span className="text-sm font-semibold text-zinc-700">{config.title}</span>
        <span
          className={cn(
            "ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold",
            config.countBg,
            config.countText,
          )}
        >
          {items.length}
        </span>
      </div>

      {/* 卡片列表 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-[11px] text-zinc-300">
              {type === "unscheduled" && "本週任務已全部排程"}
              {type === "expired" && "沒有過期任務"}
              {type === "in_progress" && "今日沒有進行中的任務"}
              {type === "completed" && "本週尚未完成任何任務"}
            </p>
          </div>
        ) : (
          items.map((item, index) => (
            <BoardCard
              key={`${item.task.id}-${item.instance?.id ?? index}`}
              task={item.task}
              instance={item.instance}
              variant={
                type === "expired" ? "expired" : type === "completed" ? "completed" : "default"
              }
              onToggleComplete={onToggleComplete}
              onMoveToNextWeek={type === "expired" ? onMoveToNextWeek : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
