import { cn } from "@/src/lib/utils";
import type { DashboardStats } from "@/src/hooks/useDashboardStats";

interface StatsGridProps {
  stats: DashboardStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const statCards = [
    {
      label: "週期進度",
      value: stats.currentWeekNumber,
      suffix: `/ ${stats.totalWeeks}`,
      progressPercent: stats.cycleProgressPercent,
      unit: "週",
    },
    {
      label: "目標進度",
      value: stats.activeGoals,
      suffix: `/ ${stats.totalGoals}`,
      progressPercent: stats.cycleProgressPercent,
      unit: "個",
    },
    {
      label: "平均執行率 (核心)",
      value: stats.coreTaskCompletionRate,
      suffix: `%`,
      progressPercent: stats.coreTaskCompletionRate,
      unit: null,
    },
    {
      label: "每週回顧",
      value: stats.weeklyReviewCount,
      suffix: `/ ${stats.currentWeekNumber}`,
      progressPercent:
        stats.currentWeekNumber > 0
          ? Math.round((stats.weeklyReviewCount / stats.currentWeekNumber) * 100)
          : 0,
      unit: "次",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {statCards.map((statCard, statCardIndex) => (
        <div key={statCardIndex} className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-[10px] text-zinc-400 mb-2">{statCard.label}</div>
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-2xl font-bold text-zinc-900">{statCard.value}</span>
            <span className="text-sm text-zinc-400">{statCard.suffix}</span>
          </div>
          {/* 進度條 */}
          <div className="h-1 bg-zinc-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-zinc-900 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(statCard.progressPercent, 100)}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}
