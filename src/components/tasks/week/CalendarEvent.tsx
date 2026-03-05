"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { PRIORITY_CONFIG } from "@/src/lib/utils/priority";
import { timeToPixels, durationToPixels } from "@/src/lib/utils/calendar";
import { useTaskInstances } from "@/src/hooks/useTaskInstance";
import type { TaskInstance, Task } from "@/src/types";

interface CalendarEventProps {
  instance: TaskInstance;
  task: Task;
  onClick: (instance: TaskInstance) => void;
}

// 優先級顏色對照
function getBorderColor(priority: string): string {
  const colorMap: Record<string, string> = {
    urgent_important: "#f43f5e",
    important: "#f59e0b",
    urgent: "#0ea5e9",
    normal: "#a1a1aa",
  };
  return colorMap[priority] ?? "#a1a1aa";
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

function getTextColor(priority: string): string {
  const colorMap: Record<string, string> = {
    urgent_important: "text-rose-500",
    important: "text-amber-700",
    urgent: "text-sky-500",
    normal: "text-zinc-400",
  };
  return colorMap[priority] ?? "text-zinc-400";
}

export function CalendarEvent({ instance, task, onClick }: CalendarEventProps) {
  const { completeInstance, uncompleteInstance, deleteInstance } = useTaskInstances();
  const [isHovered, setIsHovered] = useState(false);

  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const isCompleted = instance.status === "completed";

  const startTime = instance.scheduled_start_time ?? "09:00";
  const endTime = instance.scheduled_end_time ?? "10:00";

  const topPx = timeToPixels(startTime);
  const heightPx = durationToPixels(startTime, endTime);

  const handleCheckboxClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止冒泡，不要觸發整個事件的 onClick（避免打開 Offcanvas）
    if (isCompleted) {
      await uncompleteInstance(instance.id);
    } else {
      await completeInstance(instance.id);
    }
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteInstance(instance.id);
  };

  // 高度不夠時簡化顯示
  const isShort = heightPx < 40;

  return (
    <div
      className={cn(
        "absolute left-1 right-1 rounded-md px-2 py-1 cursor-pointer transition-opacity z-10 group",
        "border-l-[3px] text-[10px]",
        isCompleted && "opacity-45 grayscale-30",
      )}
      style={{
        top: topPx,
        height: heightPx,
        backgroundColor: priorityConfig.bgColor
          .replace("bg-", "")
          .replace("rose-50", "#fff1f3")
          .replace("amber-50", "#fffbeb")
          .replace("sky-50", "#f0f9ff")
          .replace("zinc-50", "#fafafa"),
        borderLeftColor: getBorderColor(task.priority),
        border: `1px solid ${getBorderColorLight(task.priority)}`,
        borderLeftWidth: "3px",
      }}
      onClick={() => onClick(instance)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between gap-1">
        {/* 標題 */}
        <div
          className={cn(
            "font-semibold leading-tight flex-1 truncate",
            isCompleted && "line-through",
            getTextColor(task.priority),
          )}
          style={{ fontSize: isShort ? "10px" : "12px" }}
        >
          {task.title}
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          {/* 刪除按鈕 */}
          {isHovered && !isShort && (
            <button
              type="button"
              onClick={handleDeleteClick}
              className="w-4 h-4 flex items-center justify-center rounded opacity-50 cursor-pointer hover:opacity-100 hover:text-rose-500"
            >
              <Trash2 size={12} />
            </button>
          )}

          {/* Checkbox */}
          <button
            onClick={handleCheckboxClick}
            className={cn(
              "w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-all shrink-0 cursor-pointer",
              isCompleted ? "bg-current border-current text-current" : "bg-transparent",
            )}
            style={{ borderColor: getBorderColor(task.priority) }}
          >
            {isCompleted && (
              <span style={{ fontSize: "8px", color: "#fff", lineHeight: 1 }}>✓</span>
            )}
          </button>
        </div>
      </div>

      {/* 時間 */}
      {!isShort && (
        <div
          className={cn("mt-1 opacity-70", getTextColor(task.priority))}
          style={{ fontSize: "10px", fontFamily: "monospace" }}
        >
          {startTime} - {endTime}
        </div>
      )}
    </div>
  );
}
