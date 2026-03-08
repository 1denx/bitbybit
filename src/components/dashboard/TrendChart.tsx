"use client";

import { cn } from "@/src/lib/utils";
import type { WeekStat } from "@/src/hooks/useDashboardStats";

interface TrendChartProps {
  weekStats: WeekStat[];
  currentWeekNumber: number;
}

export function TrendChart({ weekStats, currentWeekNumber }: TrendChartProps) {
  const MAX_BAR_HEIGHT = 80;
  if (weekStats.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="text-xs text-zinc-400 mb-4">12 週達成趨勢（核心任務）</div>
        <div className="flex items-center justify-center h-20 text-zinc-300 text-sm">尚無資料</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-zinc-600">12 週達成趨勢（核心任務）</span>
        {/* 圖例 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-zinc-900"></div>
            <span className="text-[10px] text-zinc-400">已完成</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-zinc-200 border border-dashed border-zinc-300"></div>
            <span className="text-[10px] text-zinc-400">進行中</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-zinc-100"></div>
            <span className="text-[10px] text-zinc-400">未開始</span>
          </div>
        </div>
      </div>

      {/* 長條圖 */}
      <div className="flex items-end gap-1.5" style={{ height: MAX_BAR_HEIGHT + 32 }}>
        {weekStats.map(weekStat => {
          const barHeightPx = weekStat.isFuture
            ? 4
            : weekStat.isCurrent
              ? Math.max(((weekStat.completionRate ?? 0) / 100) * MAX_BAR_HEIGHT, 4)
              : weekStat.completionRate !== null
                ? Math.max((weekStat.completionRate / 100) * MAX_BAR_HEIGHT, 4)
                : 4;

          return (
            <div key={weekStat.weekNumber} className="flex-1 flex flex-col items-center gap-1">
              {/* 百分比標籤 */}
              <div className="text-[9px] text-zinc-400 h-4 flex items-center">
                {weekStat.isFuture
                  ? ""
                  : weekStat.completionRate !== null
                    ? `${weekStat.completionRate}%`
                    : ""}
              </div>

              {/* 長條 */}
              <div
                className={cn(
                  "w-full rounded-t-sm transition-all duration-300",
                  weekStat.isFuture
                    ? "bg-zinc-100"
                    : weekStat.isCurrent
                      ? "bg-zinc-300 border border-dashed border-zinc-400"
                      : "bg-zinc-900",
                )}
                style={{ height: barHeightPx }}
              />

              {/* 週次標籤 */}
              <div
                className={cn(
                  "text-[10px]",
                  weekStat.isCurrent ? "text-zinc-900 font-bold" : "text-zinc-400",
                )}
              >
                W{weekStat.weekNumber}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
