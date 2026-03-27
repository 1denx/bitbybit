"use client";

import { useState, useRef, useCallback } from "react";
import { Trash2 } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/src/lib/utils";
import { PRIORITY_CONFIG } from "@/src/lib/utils/priority";
import { timeToPixels, durationToPixels, SLOT_HEIGHT, START_HOUR } from "@/src/lib/utils/calendar";
import { useTaskInstances } from "@/src/hooks/useTaskInstance";
import type { TaskInstance, Task } from "@/src/types";

interface CalendarEventProps {
  instance: TaskInstance;
  task: Task;
  onClick: (instance: TaskInstance) => void;
}

function formatTime(time: string | null): string {
  if (!time) return "";
  return time.slice(0, 5);
}

// 像素轉時間字串
function pixelsToTimeStr(pixels: number): string {
  const totalMinutes = Math.round(pixels / SLOT_HEIGHT) * 30 * START_HOUR * 60;
  const clampedMinutes = Math.max(START_HOUR * 60, totalMinutes);
  const hours = Math.floor(clampedMinutes / 60);
  const minutes = clampedMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// 時間字串轉分鐘數
function timeStrToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// 優先級顏色對照
function getBgColor(priority: string): string {
  const colorMap: Record<string, string> = {
    urgent_important: "#fff1f3",
    important: "#fffbeb",
    urgent: "#f0f9ff",
    normal: "#fafafa",
  };
  return colorMap[priority] ?? "#fafafa";
}

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
  const { completeInstance, uncompleteInstance, deleteInstance, rescheduleInstance } =
    useTaskInstances();
  const [isHovered, setIsHovered] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // resize 過程中的預覽時間（未送出 DB 前先 local 顯示）
  const [previewEndTime, setPreviewEndTime] = useState<string | null>(null);

  const resizeStartYRef = useRef<number>(0);
  const resizeStartEndTimeRef = useRef<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const isCompleted = instance.status === "completed";

  const startTime = formatTime(instance.scheduled_start_time) ?? "09:00";
  const endTime = formatTime(previewEndTime ?? instance.scheduled_end_time) ?? "10:00";

  const topPx = timeToPixels(startTime);
  const heightPx = durationToPixels(startTime, endTime);

  // 高度不夠時簡化顯示
  const isShort = heightPx < 40;

  // useDraggable (讓時間塊可拖曳)
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `instance-${instance.id}`,
    data: {
      type: "instance", // 區分來自左側列表，還是週曆中的
      taskId: task.id,
      goalId: task.goal_id,
      instanceId: instance.id,
      originalDate: instance.scheduled_date,
      originalStartTime: startTime,
      originalEndTime: endTime,
    },
    disabled: isCompleted || isResizing,
  });

  // Resize
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      setIsResizing(true);
      resizeStartYRef.current = e.clientY;
      resizeStartEndTimeRef.current = instance.scheduled_end_time ?? "10:00";

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaY = moveEvent.clientY - resizeStartYRef.current;
        const deltaSlots = Math.round(deltaY / SLOT_HEIGHT);
        const deltaMinutes = deltaSlots * 30;

        const originalEndMinutes = timeStrToMinutes(resizeStartEndTimeRef.current);
        const startMinutes = timeStrToMinutes(startTime);

        // 最小高度:至少 30 分鐘 (1格)
        const newEndMinutes = Math.max(startMinutes + 30, originalEndMinutes + deltaMinutes);

        // 最大:23:30
        const clampedEndMinutes = Math.min(newEndMinutes, 23 * 60 + 30);

        const newEndHours = Math.floor(clampedEndMinutes / 60);
        const newEndMins = clampedEndMinutes % 60;
        const newEndTimeStr = `${String(newEndHours).padStart(2, "0")}:${String(newEndMins).padStart(2, "0")}`;

        setPreviewEndTime(newEndTimeStr);
      };

      const handleMouseUp = async () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);

        // 取得最終的預覽時間並送出 DB
        setPreviewEndTime(finalEndTime => {
          if (finalEndTime && finalEndTime !== resizeStartEndTimeRef.current) {
            rescheduleInstance({
              instanceId: instance.id,
              scheduledDate: instance.scheduled_date ?? "",
              scheduledStartTime: startTime,
              scheduledEndTime: finalEndTime,
            });
          }
          return null; // 清除預覽，之後由 store 的 instance 資料顯示
        });
      };
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [instance, startTime, rescheduleInstance],
  );

  // Checkbox / Delete
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

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "absolute left-1 right-1 rounded-md px-2 py-1 z-10 group",
        "border-l-[3px] text-[10px]",
        isDragging ? "opacity-20 cursor-grabbing" : cn("px-2 py-1"),
        isCompleted && "opacity-45 grayscale-30",
        isResizing ? "cursor-ns-resize select-none" : "cursor-grab active:cursor-grabbing",
      )}
      style={{
        top: topPx,
        height: heightPx,
        backgroundColor: getBgColor(task.priority),
        border: `1px solid ${getBorderColorLight(task.priority)}`,
        borderLeftWidth: "3px",
        borderLeftColor: getBorderColor(task.priority),
      }}
      onClick={() => !isResizing && onClick(instance)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* isDragging 時隱藏內容 */}
      {!isDragging && (
        <>
          <div className="flex items-start justify-between gap-2">
            <button
              onClick={handleCheckboxClick}
              className="w-4 h-4 rounded-full border-[1.5px] transition-all shrink-0 cursor-pointer hidden lg:block"
              style={{
                borderColor: getBorderColor(task.priority),
                backgroundColor: isCompleted ? getBorderColor(task.priority) : "transparent",
              }}
            >
              {isCompleted && (
                <span style={{ fontSize: "8px", color: "#fff", lineHeight: 1 }}>✓</span>
              )}
            </button>
            <div className="flex-1">
              <div
                className={cn(
                  "font-semibold leading-tight flex-1 text-wrap",
                  isCompleted && "line-through",
                  getTextColor(task.priority),
                )}
                style={{ fontSize: isShort ? "10px" : "12px" }}
              >
                {task.title}
              </div>
              {!isShort && (
                <div
                  className={cn("mt-1 opacity-70 hidden lg:block", getTextColor(task.priority))}
                  style={{ fontSize: "10px", fontFamily: "monospace" }}
                >
                  {startTime} – {endTime}
                  {isResizing && <span className="ml-1 font-semibold opacity-100">↕</span>}
                </div>
              )}
            </div>

            <div>
              {isHovered && !isShort && (
                <button
                  onClick={handleDeleteClick}
                  className="w-4 h-4 flex items-center justify-center rounded opacity-50 cursor-pointer hover:opacity-100 hover:text-rose-500"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Resize Handle */}
          {!isCompleted && (
            <div
              onMouseDown={handleResizeMouseDown}
              className={cn(
                "absolute bottom-0 left-0 right-0 h-2 rounded-b-md",
                "flex items-center justify-center cursor-ns-resize transition-opacity",
                isHovered || isResizing ? "opacity-100" : "opacity-0",
              )}
              style={{ backgroundColor: getBorderColor(task.priority) + "40" }}
            >
              <div className="flex flex-col gap-px">
                <div
                  className="w-6 rounded-full"
                  style={{
                    height: "2px",
                    backgroundColor: getBorderColor(task.priority),
                    opacity: 0.6,
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
