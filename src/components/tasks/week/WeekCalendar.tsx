"use client";

import { format, isToday } from "date-fns";
import { CalendarDayColumn } from "./CalendarDayColumn";
import { generateTimeSlots, SLOT_HEIGHT } from "@/src/lib/utils/calendar";
import { cn } from "@/src/lib/utils";
import type { TaskInstance, Task } from "@/src/types";

interface WeekCalendarProps {
  weekDays: Date[];
  taskInstances: TaskInstance[];
  taskMap: Record<string, Task>;
  onEventClick: (instance: TaskInstance) => void;
}

export function WeekCalendar({
  weekDays,
  taskInstances,
  taskMap,
  onEventClick,
}: WeekCalendarProps) {
  const timeSlots = generateTimeSlots();
  const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Day Headers */}
      <div className="flex border-b border-zinc-200 shrink-0 bg-white">
        {/* Time gutter */}
        <div className="w-12 shrink-0 border-r border-zinc-200" />

        {/* Day header cells */}
        {weekDays.map((day, dayIndex) => {
          const isCurrentDay = isToday(day);
          return (
            <div
              key={dayIndex}
              className="flex-1 flex flex-col items-center justify-center py-2 border-r border-zinc-200 last:border-r-0"
            >
              <span className="text-[10px] text-zinc-400 font-mono mb-1">
                {DAY_LABELS[dayIndex]}
              </span>
              <span
                className={cn(
                  "text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full",
                  isCurrentDay ? "bg-zinc-900 text-white text-xs" : "text-zinc-700",
                )}
              >
                {format(day, "d")}
              </span>
            </div>
          );
        })}
      </div>

      {/* Scrollable Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-1 overflow-y-auto">
          {/* Time labels column */}
          <div className="w-12 shrink-0 border-r border-zinc-200">
            {timeSlots.map((slot, slotIndex) => (
              <div
                key={slotIndex}
                className="flex items-start justify-end pr-2 pt-0.5"
                style={{ height: SLOT_HEIGHT }}
              >
                {slot.isHourStart && (
                  <span className="text-[10px] text-zinc-400 font-mono leading-none">
                    {slot.label}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIndex) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayInstances = taskInstances.filter(
              instance => instance.scheduled_date === dateStr && instance.status !== "expired",
            );

            return (
              <CalendarDayColumn
                key={dayIndex}
                date={day}
                instances={dayInstances}
                taskMap={taskMap}
                isToday={isToday(day)}
                onEventClick={onEventClick}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
