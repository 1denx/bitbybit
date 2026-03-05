"use client";
import { useRef } from "react";
import { useDroppable } from "@dnd-kit/core";
import { format } from "date-fns";
import { cn } from "@/src/lib/utils";
import { CalendarEvent } from "./CalendarEvent";
import {
  generateTimeSlots,
  pixelsToTime,
  getDefaultEndTime,
  SLOT_HEIGHT,
} from "@/src/lib/utils/calendar";
import type { TaskInstance, Task } from "@/src/types";

interface CalendarDayColumnProps {
  date: Date;
  instances: TaskInstance[];
  taskMap: Record<string, Task>;
  isToday: boolean;
  onEventClick: (instance: TaskInstance) => void;
}

export function CalendarDayColumn({
  date,
  instances,
  taskMap,
  isToday,
  onEventClick,
}: CalendarDayColumnProps) {
  const dateStr = format(date, "yyyy-MM-dd");
  const timeSlots = generateTimeSlots();
  const columnRef = useRef<HTMLDivElement>(null);

  const { setNodeRef, isOver } = useDroppable({
    id: `day-${dateStr}`,
    data: { dateStr },
  });

  const setRefs = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    (columnRef as React.RefObject<HTMLDivElement | null>).current = node;
  };

  return (
    <div
      ref={setNodeRef}
      data-date={dateStr}
      data-column="true"
      className={cn(
        "flex-1 border-r border-zinc-100 relative min-w-0",
        isToday && "bg-zinc-50/60",
        isOver && "bg-zinc-100/80",
      )}
    >
      {/* 時間格子 */}
      {timeSlots.map((slot, slotIndex) => (
        <div
          key={`${slot.hour}-${slot.minute}`}
          className={cn(
            "border-zinc-100",
            slot.isHourStart
              ? "border-t border-b border-dashed border-zinc-100"
              : "border-b border-dashed border-zinc-100/70",
          )}
          style={{ height: SLOT_HEIGHT }}
        />
      ))}

      {/* 事件渲染 */}
      {instances.map(instance => {
        const task = taskMap[instance.task_id];
        if (!task) return null;
        return (
          <CalendarEvent key={instance.id} instance={instance} task={task} onClick={onEventClick} />
        );
      })}
    </div>
  );
}
