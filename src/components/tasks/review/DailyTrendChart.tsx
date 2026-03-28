import { cn } from "@/src/lib/utils";
import { format, parseISO, startOfWeek, addDays } from "date-fns";
import type { Task, TaskInstance } from "@/src/types";

interface DailyTrendChartProps {
  weekInstances: TaskInstance[];
  tasks: Task[];
  weekStartDate: string;
  todayStr: string;
}

export function DailyTrendChart({
  weekInstances,
  tasks,
  weekStartDate,
  todayStr,
}: DailyTrendChartProps) {
  const MAX_BAR_HEIGHT = 60;

  // 核心任務 id set
  const coreTaskIds = new Set(tasks.filter(task => task.category === "core").map(task => task.id));

  // 產生週一到週日 7 天
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(parseISO(weekStartDate), i);
    return {
      dateStr: format(date, "yyyy-MM-dd"),
      label: format(date, "EEE"),
    };
  });

  // 每天的核心任務統計
  const dayStats = weekDays.map(({ dateStr, label }) => {
    const dayInstances = weekInstances.filter(
      inst => inst.scheduled_date === dateStr && coreTaskIds.has(inst.task_id),
    );

    const total = dayInstances.filter(inst => inst.status !== "expired").length;

    const completed = dayInstances.filter(inst => inst.status === "completed").length;

    const isToday = dateStr === todayStr;
    const isFuture = dateStr > todayStr;
    const rate = total > 0 ? Math.round((completed / total) * 100) : null;

    console.log(
      "dayInstances",
      dateStr,
      dayInstances.map(i => ({ title: i.task_id, status: i.status })),
    );

    return { dateStr, label, total, completed, isToday, isFuture, rate };
  });

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="text-xs font-medium text-zinc-500 mb-4">每日達成趨勢（核心任務）</div>
      <div className="flex items-end gap-2" style={{ height: MAX_BAR_HEIGHT + 40 }}>
        {dayStats.map(day => {
          const barHeight = day.isFuture
            ? 4
            : day.isToday
              ? Math.max(((day.rate ?? 0) / 100) * MAX_BAR_HEIGHT, 4)
              : day.rate !== null
                ? Math.max((day.rate / 100) * MAX_BAR_HEIGHT, 4)
                : 4;

          return (
            <div key={day.dateStr} className="flex-1 flex flex-col items-center gap-1">
              {/* 百分比 */}
              <div className="text-[10px] text-zinc-400 h-4 flex items-center">
                {day.isFuture ? "" : day.rate !== null ? `${day.rate}%` : "-"}
              </div>

              {/* 長條 */}
              <div
                className={cn(
                  "w-full rounded-t-sm transition-all duration-300",
                  day.isFuture
                    ? "bg-zinc-100"
                    : day.isToday
                      ? "bg-zinc-300 border border-dashed border-zinc-400"
                      : day.rate !== null
                        ? "bg-zinc-900"
                        : "bg-zinc-100",
                )}
                style={{ height: barHeight }}
              />

              {/* 星期標籤 */}
              <div
                className={cn(
                  "text-[10px] text-center",
                  day.isToday ? "text-zinc-900 font-bold" : "text-zinc-400",
                )}
              >
                {day.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
