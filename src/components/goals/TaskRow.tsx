import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { PRIORITY_CONFIG, FREQUENCY_OPTIONS } from "@/src/lib/utils/priority";
import { cn } from "@/src/lib/utils";
import type { Task } from "@/src/types";

interface TaskRowProps {
  task: Task;
  onDelete: (taskId: string) => void;
}

export function TaskRow({ task, onDelete }: TaskRowProps) {
  const priorityConfig = PRIORITY_CONFIG[task.priority];

  const frequencyLabel =
    FREQUENCY_OPTIONS.find(option => option.value === task.frequency)?.label ?? task.frequency;

  const weekRangeLabel = (() => {
    if (task.scheduled_weeks.length === 0) return "未設定週數";
    if (task.scheduled_weeks.length === 12) return "W1 - W12";

    const sortedWeeks = [...task.scheduled_weeks].sort((weekA, weekB) => weekA - weekB);
    const firstWeek = sortedWeeks[0];
    const lastWeek = sortedWeeks[sortedWeeks.length - 1];
    return `W${firstWeek} - W${lastWeek}`;
  })();

  return (
    <div
      className={cn(
        "flex items-center gap-3 py-2.5 px-3 rounded-lg border-l-4 bg-zinc-50 hover:bg-zinc-100 transition-colors group",
        priorityConfig.borderColor,
      )}
    >
      {/* 優先級 Dot */}
      <div className={cn("w--2 h-2 shrink-0 rounded-full", priorityConfig.dotColor)} />

      {/* 任務名稱 */}
      <span className="flex-1 text-sm text-zinc-700 truncate">{task.title}</span>

      {/* Badges */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* 核心/額外 */}
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            task.category === "core"
              ? "bg-zinc-900 text-white"
              : "bg-zinc-100 text-zinc-500 border border-zinc-200",
          )}
        >
          {task.category === "core" ? "核心" : "額外"}
        </span>

        {/* 頻率 */}
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 border border-zinc-200">
          {frequencyLabel}
        </span>

        {/* 執行週數 */}
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 border border-zinc-200">
          {weekRangeLabel}
        </span>
      </div>

      {/* 刪除按鈕 */}
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-6 w-6 shrink-0 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
        onClick={() => onDelete(task.id)}
      >
        <Trash2 size={12} />
      </Button>
    </div>
  );
}
