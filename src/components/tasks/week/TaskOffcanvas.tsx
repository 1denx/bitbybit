"use client";

import { useState } from "react";
import { format, parseISO, addHours } from "date-fns";
import { CheckCircle, Circle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../ui/sheet";
import { Separator } from "../../ui/separator";
import { PRIORITY_CONFIG, FREQUENCY_OPTIONS } from "@/src/lib/utils/priority";
import { cn } from "@/src/lib/utils";
import type { TaskInstance, Task } from "@/src/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Button } from "../../ui/button";

interface TaskOffcanvasProps {
  open: boolean;
  onClose: () => void;
  instance: TaskInstance | null;
  task: Task | null;
  weekInstances: TaskInstance[];
  onComplete: (instanceId: string) => void;
  onUncomplete: (instanceId: string) => void;
  weekDays?: Date[];
  onSchedule?: (dateStr: string, startTime: string, endTime: string) => Promise<void>;
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
  weekDays,
  onSchedule,
}: TaskOffcanvasProps) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedHour, setSelectHour] = useState<string>("09");
  const [selectMinute, setSelectMinute] = useState<string>("00");
  const [isScheduling, setIsScheduling] = useState(false);

  if (!task) return null;

  const isScheduleMode = !instance && !!onSchedule;

  const handleSchedule = async () => {
    if (!selectedDate || !onSchedule) return;
    setIsScheduling(true);
    const startTime = `${selectedHour}:${selectMinute}`;
    const [h, m] = startTime.split(":").map(Number);
    const endH = Math.min(h + 1, 23);
    const endTime = `${String(endH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    await onSchedule(selectedDate, startTime, endTime);
    setIsScheduling(false);

    setSelectedDate("");
    setSelectHour("09");
    setSelectMinute("00");
  };

  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const isCompleted = instance?.status === "completed";

  const frequencyLabel =
    FREQUENCY_OPTIONS.find(option => option.value === task.frequency)?.label ?? task.frequency;

  const weekRangeLabel = (() => {
    if (task.scheduled_weeks.length === 0) return "未設定";
    if (task.scheduled_weeks.length === 12) return "W1 - W12";

    const sortedWeeks = [...task.scheduled_weeks].sort((weekA, weekB) => weekA - weekB);
    return `W${sortedWeeks[0]} - W${sortedWeeks[sortedWeeks.length - 1]}`;
  })();

  const handleToggleComplete = () => {
    if (!instance) return;
    if (isCompleted) {
      onUncomplete(instance.id);
    } else {
      onComplete(instance.id);
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = ["00", "30"];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-75 sm:w-[320px] p-0" side="right">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-5 pt-5 pb-4 border-b border-zinc-100">
            <SheetTitle className="text-sm font-semibold leading-snug text-left">
              {task.title}
            </SheetTitle>
            {isScheduleMode && (
              <p className="text-xs text-zinc-400 mt-1">選擇日期與時間排程此任務</p>
            )}
          </SheetHeader>

          {/* 排程模式 */}
          {isScheduleMode && weekDays && (
            <div className="px-5">
              {/* 日期選擇 */}
              <div className="space-y-2 py-4">
                <p className="text-xs font-medium text-zinc-600">選擇日期</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {weekDays.map(day => {
                    const dateStr = format(day, "yyyy/MM/dd");
                    const isSelected = selectedDate === dateStr;
                    const dayLabel = format(day, "EEE");
                    const dateNum = format(day, "d");

                    return (
                      <button
                        type="button"
                        key={dateStr}
                        onClick={() => setSelectedDate(dateStr)}
                        className={cn(
                          "flex flex-col items-center py-2 rounded-lg border text-xs transition-colors cursor-pointer",
                          isSelected
                            ? "bg-zinc-900 text-white border-zinc-900"
                            : "border-zinc-200 text-zinc-600 hover:border-zinc-400",
                        )}
                      >
                        <span className="text-[10px] opacity-70">{dayLabel}</span>
                        <span className="font-medium">{dateNum}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* 時間選擇 */}
              <div className="space-y-2 py-4">
                <p className="text-xs font-medium text-zinc-600">開始時間</p>
                <div className="flex items-center gap-2">
                  {/* 小時 */}
                  <Select value={selectedHour} onValueChange={setSelectHour}>
                    <SelectTrigger className="flex-1 h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-48">
                      {hours.map(h => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>

                    <span className="text-zinc-400 font-medium shrink-0">:</span>

                    {/* 分鐘 */}
                    <Select value={selectMinute} onValueChange={setSelectMinute}>
                      <SelectTrigger className="flex-1 h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {minutes.map(m => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Select>
                </div>

                {/* 結束時間預覽 */}
                <p className="text-[10px] text-zinc-400">
                  結束時間：{String(Math.min(parseInt(selectedHour) + 1, 23)).padStart(2, "0")}:
                  {selectMinute}（預設 1 小時）
                </p>
              </div>
              <div className="flex justify-end pb-4">
                <Button
                  variant="default"
                  onClick={handleSchedule}
                  disabled={!selectedDate || isScheduling}
                >
                  {isScheduling ? "排程中..." : "確認排程"}
                </Button>
              </div>
              <Separator />
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* 已排程模式 */}
            {!isScheduleMode && instance && (
              <>
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
              </>
            )}

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

              {instance?.scheduled_start_time && (
                <InfoRow label="排程時間">
                  <span className="text-xs font-mono text-zinc-600">
                    {instance.scheduled_start_time} - {instance.scheduled_end_time}
                  </span>
                </InfoRow>
              )}

              {instance?.scheduled_date && (
                <InfoRow label="排程日期">
                  <span className="text-xs text-zinc-600">
                    {format(parseISO(instance.scheduled_date), "M/d (EEE)")}
                  </span>
                </InfoRow>
              )}
            </div>

            <Separator />

            {/* 本週紀錄 (排程模式不顯示) */}
            {!isScheduleMode && weekInstances.length > 0 && (
              <>
                <Separator />
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
                            : instance && weekInstance.id === instance.id
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
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
