import { cn } from "@/src/lib/utils";
import type { WeekRate } from "@/src/hooks/useHistoryStats";

interface WeekRateChartProps {
  weekRates: WeekRate[];
  avgRate: number | null;
}

function getRateColor(rate: number | null): string {
  if (rate === null) return "bg-zinc-100 text-zinc-400";
  if (rate >= 85) return "bg-emerald-100 text-emerald-700";
  if (rate >= 70) return "bg-sky-100 text-sky-700";
  if (rate >= 50) return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-600";
}

function getAvgColor(rate: number | null): string {
  if (rate === null) return "bg-zinc-200 text-zinc-500";
  if (rate >= 85) return "bg-emerald-500 text-white";
  if (rate >= 70) return "bg-sky-500 text-white";
  if (rate >= 50) return "bg-amber-400 text-white";
  return "bg-rose-400 text-white";
}

export function WeekRateChart({ weekRates, avgRate }: WeekRateChartProps) {
  return (
    <div>
      {/* 桌機版 */}
      <div className="hidden sm:block">
        {/* 週次標題列 */}
        <div className="flex items-center gap-1.5 m-1.5">
          <div className="w-8 shrink-0" />
          {weekRates.map(week => (
            <div key={week.weekNumber} className="flex-1 text-center text-[10px] text-zinc-400">
              W{week.weekNumber}
            </div>
          ))}
          <div className="w-14 shrink-0 text-center text-[10px] text-zinc-400">AVG</div>
        </div>

        {/* 達成率色塊列 */}
        <div className="flex items-center gap-1.5">
          <div className="w-8 shrink-0 text-[10px] text-zinc-400">達成</div>
          {weekRates.map(week => (
            <div
              key={week.weekNumber}
              className={cn(
                "flex-1 rounded-md py-1.5 text-center text-xs font-semibold",
                getRateColor(week.rate),
              )}
            >
              {week.rate !== null ? `${week.rate}%` : "-"}
            </div>
          ))}

          {/* AVG 色塊 */}
          <div
            className={cn(
              "w-14 shrink-0 rounded-md py-1.5 text-center text-xs font-bold",
              getAvgColor(avgRate),
            )}
          >
            {avgRate !== null ? `${avgRate}%` : "-"}
          </div>
        </div>
      </div>

      {/* 手機版 */}
      <div className="sm:hidden">
        <div className="space-y-1.5 py-2">
          {weekRates.map(week => (
            <div key={week.weekNumber} className="flex items-center gap-3">
              <div className="w-8 shrink-0 text-xs text-zinc-400">W{week.weekNumber}</div>
              <div
                className={cn(
                  "flex-1 rounded-md py-1.5 px-3 text-xs text-center font-semibold",
                  getRateColor(week.rate),
                )}
              >
                {week.rate !== null ? `${week.rate}%` : "-"}
              </div>
            </div>
          ))}
        </div>

        {/* AVG */}
        <div className="flex items-center gap-3 pt-2 border-t border-zinc-200">
          <div className="w-8 shrink-0 text-xs text-zinc-400">AVG</div>
          <div
            className={cn(
              "flex-1 rounded-md py-1.5 px-3 text-xs text-center font-bold",
              getAvgColor(avgRate),
            )}
          >
            {avgRate !== null ? `${avgRate}%` : "-"}
          </div>
        </div>
      </div>
    </div>
  );
}
