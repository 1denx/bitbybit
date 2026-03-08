"use client";

import { format, parseISO } from "date-fns";
import { CheckCircle, Circle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { PRIORITY_CONFIG, FREQUENCY_OPTIONS } from "@/src/lib/utils/priority";
import { cn } from "@/src/lib/utils";
import type { TaskInstance, Task } from "@/src/types";

interface TaskOffcanvasProps {
  open: boolean;
  onClose: () => void;
  instance: TaskInstance | null;
  task: Task | null;
  weekInstances: TaskInstance[];
  onComplete: (instanceId: string) => void;
  onUncomplete: (instanceId: string) => void;
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-zinc-400">{label}</span>
      {children}
    </div>
  );
}

function getBorderColorLight(priority: string): string {
  const colorMap: Record<string, string> = {
    urgent_important: "#fecdd3",
    important: "#fde68a",
    urgent: "#bae6fd",
    normal: "#e4e4e7",
  };
  return colorMap[priority] ?? "#e4e4e7";
}

export function TaskOffcanvas({
  open,
  onClose,
  instance,
  task,
  weekInstances,
  onComplete,
  onUncomplete,
}: TaskOffcanvasProps) {
  if (!instance || !task) return null;

  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const isCompleted = instance.status === "completed";

  const frequencyLabel =
    FREQUENCY_OPTIONS.find(option => option.value === task.frequency)?.label ?? task.frequency;

  const weekRangeLabel = (() => {
    if (task.scheduled_weeks.length === 0) return "未設定";
    if (task.scheduled_weeks.length === 12) return "W1 - W12";

    const sortedWeeks = [...task.scheduled_weeks].sort((weekA, weekB) => weekA - weekB);
    return `W${sortedWeeks[0]} - W${sortedWeeks[sortedWeeks.length - 1]}`;
  })();

  const handleToggleComplete = () => {
    if (isCompleted) {
      onUncomplete(instance.id);
    } else {
      onComplete(instance.id);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-75 sm:w-[320px] p-0" side="right">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-5 pt-5 pb-4 border-b border-zinc-100">
            <div className="flex items-start justify-between gap-3">
              <SheetTitle className="text-sm font-semibold leading-snug text-left">
                {task.title}
              </SheetTitle>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* 完成按鈕 */}
            <button
              type="button"
              onClick={handleToggleComplete}
              className={cn(
                "w-full flex items-center gap-3 rounded-lg border p-3 transition-colors cursor-pointer",
                isCompleted
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100",
              )}
            >
              {isCompleted ? (
                <CheckCircle size={18} className="text-emerald-500 shrink-0" />
              ) : (
                <Circle size={18} className="text-zinc-400 shrink-0" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  isCompleted ? "text-emerald-600" : "text-zinc-600",
                )}
              >
                {isCompleted ? "已完成，點擊取消" : "標記為完成"}
              </span>
            </button>

            <Separator />

            {/* 任務資訊 */}
            <div className="space-y-3">
              <InfoRow label="任務類別">
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
              </InfoRow>

              <InfoRow label="優先級">
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs",
                    priorityConfig.bgColor,
                    priorityConfig.textColor,
                  )}
                  style={{ border: `1px solid ${getBorderColorLight(task.priority)}` }}
                >
                  {priorityConfig.label}
                </span>
              </InfoRow>

              <InfoRow label="執行頻率">
                <span className="text-xs text-zinc-600">{frequencyLabel}</span>
              </InfoRow>

              <InfoRow label="執行週數">
                <span className="text-xs text-zinc-600">{weekRangeLabel}</span>
              </InfoRow>

              {instance.scheduled_start_time && (
                <InfoRow label="排程時間">
                  <span className="text-xs font-mono text-zinc-600">
                    {instance.scheduled_start_time} - {instance.scheduled_end_time}
                  </span>
                </InfoRow>
              )}

              {instance.scheduled_date && (
                <InfoRow label="排程日期">
                  <span className="text-xs text-zinc-600">
                    {format(parseISO(instance.scheduled_date), "M/d (EEE)")}
                  </span>
                </InfoRow>
              )}
            </div>

            <Separator />

            {/* 本週紀錄 */}
            <div>
              <p className="text-xs text-zinc-400 mb-2.5">本週執行紀錄</p>
              <div className="flex gap-1.5">
                {weekInstances.map((weekInstance, weekInstanceIndex) => (
                  <div
                    key={weekInstanceIndex}
                    className={cn(
                      "w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-medium",
                      weekInstance.status === "completed"
                        ? "bg-zinc-900 text-white"
                        : weekInstance.id === instance.id
                          ? "bg-zinc-100 border-2 border-zinc-400 text-zinc-500"
                          : "bg-zinc-100 border border-zinc-200 text-zinc-400",
                    )}
                    title={weekInstance.scheduled_date ?? ""}
                  >
                    {weekInstance.status === "completed" ? "✓" : "—"}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
