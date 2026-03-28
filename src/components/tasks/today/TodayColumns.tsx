"use client";

import { CheckCircle2, Plus, Clock } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { FREQUENCY_OPTIONS, PRIORITY_CONFIG } from "@/src/lib/utils/priority";
import { formatTimeStr } from "@/src/lib/utils/calendar";
import type { Task, TaskInstance } from "@/src/types";

// 欄位內的任務卡片
interface TodayColumnCardProps {
  task: Task;
  instance: TaskInstance | null;
  isCompleted: boolean;
  onToggleComplete: (instanceId: string) => void;
}

function TodayColumnCard({ task, instance, isCompleted, onToggleComplete }: TodayColumnCardProps) {
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const frequencyLabel =
    FREQUENCY_OPTIONS.find(option => option.value === task.frequency)?.label ?? task.frequency;

  const startTime = formatTimeStr(instance?.scheduled_start_time);
  const endTime = formatTimeStr(instance?.scheduled_end_time);
  const hasTime = !!startTime && !!endTime;

  return (
    <div
      className={cn(
        "rounded-lg border border-zinc-200 bg-white p-3",
        "border-l-[3px] transition-all",
        isCompleted && "bg-zinc-50",
        priorityConfig.borderColor,
      )}
    >
      {/* 標題列 */}
      <div className="flex items-start gap-2">
        {instance && (
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
              "text-sm font-medium text-zinc-800 truncate",
              isCompleted && "line-through text-zinc-400",
            )}
          >
            {task.title}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-1.5 md:mt-1">
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-medium hidden md:block",
                task.category === "core"
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-500 border border-zinc-200",
              )}
            >
              {task.category === "core" ? "核心" : "額外"}
            </span>
            <span className="text-[10px] text-zinc-400 hidden md:block">{frequencyLabel}</span>
          </div>

          {/* 排程時間 */}
          {hasTime && (
            <div className="mt-2 text-[10px] text-zinc-400 font-mono hidden md:block">
              {startTime} - {endTime}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 欄位容器
interface TodayColumnProps {
  title: string;
  count: number;
  countVariant: "dark" | "outline" | "amber";
  emptyMessage: string;
  children: React.ReactNode;
}

function TodayColumn({ title, count, countVariant, emptyMessage, children }: TodayColumnProps) {
  return (
    <div className="flex flex-col min-h-0 border border-t-0 border-r-zinc-200 p-4">
      {/* 欄標題 */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-zinc-200">
        <span className="text-sm font-semibold text-zinc-700">{title}</span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-medium ml-auto",
            countVariant === "dark" && "bg-zinc-900 text-white",
            countVariant === "outline" && "border border-zinc-200 text-zinc-500",
            countVariant === "amber" && "bg-amber-50 text-amber-600 border border-amber-200",
          )}
        >
          {count}
        </span>
      </div>

      {/* 卡片列表 */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        {count === 0 ? (
          <div className="text-center py-6">
            <p className="text-xs text-zinc-300">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

interface TodayColumnsProps {
  todayInstances: TaskInstance[];
  allTasks: Task[];
  taskMap: Record<string, Task>;
  weekNumber: number;
  onToggleComplete: (instance: string) => void;
}

export function TodayColumns({
  todayInstances,
  allTasks,
  taskMap,
  weekNumber,
  onToggleComplete,
}: TodayColumnsProps) {
  // 已完成的 instances
  const completedInstances = todayInstances.filter(instance => instance.status === "completed");

  // 未完成的排程 instances
  const pendingInstances = todayInstances.filter(instance => instance.status === "scheduled");

  // 有排程的額外任務
  const extraTasks = allTasks.filter(task => {
    const isThisWeek = task.scheduled_weeks.includes(weekNumber);
    const isExtra = task.category === "extra";
    return isThisWeek && isExtra;
  });

  return (
    <div className="flex-1 overflow-auto">
      <div className="grid sm:grid-cols-3 h-full">
        {/* 欄一:額外任務 */}
        <TodayColumn
          title="額外任務"
          count={extraTasks.length}
          countVariant="outline"
          emptyMessage="本週沒有額外任務"
        >
          {extraTasks.map(task => (
            <TodayColumnCard
              key={task.id}
              task={task}
              instance={null}
              isCompleted={false}
              onToggleComplete={onToggleComplete}
            />
          ))}
        </TodayColumn>

        {/* 欄二:已完成 */}
        <TodayColumn
          title="已完成"
          count={completedInstances.length}
          countVariant="dark"
          emptyMessage="今日尚未完成任何任務"
        >
          {completedInstances.map(instance => {
            const task = taskMap[instance.task_id];
            if (!task) return null;
            return (
              <TodayColumnCard
                key={instance.id}
                task={task}
                instance={instance}
                isCompleted
                onToggleComplete={onToggleComplete}
              />
            );
          })}
        </TodayColumn>

        {/* 欄三:未完成 */}
        <TodayColumn
          title="未完成"
          count={pendingInstances.length}
          countVariant="amber"
          emptyMessage="今日任務已全部完成"
        >
          {pendingInstances.map(instance => {
            const task = taskMap[instance.task_id];
            if (!task) return null;
            return (
              <TodayColumnCard
                key={instance.id}
                task={task}
                instance={instance}
                isCompleted={false}
                onToggleComplete={onToggleComplete}
              />
            );
          })}
        </TodayColumn>
      </div>
    </div>
  );
}
