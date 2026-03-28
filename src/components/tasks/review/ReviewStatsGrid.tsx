import { cn } from "@/src/lib/utils";

interface ReviewStats {
  totalCount: number;
  completedCount: number;
  pendingCount: number;
  coreCompletionRate: number;
  totalCore: number;
  totalExtra: number;
  completedCore: number;
  completedExtra: number;
  pendingCore: number;
  pendingExtra: number;
}

interface ReviewStatsGridProps {
  stats: ReviewStats;
}

export function ReviewStatsGrid({ stats }: ReviewStatsGridProps) {
  const cards = [
    {
      label: "項目總數",
      value: stats.totalCount,
      suffix: "",
      color: "text-zinc-900",
      sub: `核心 ${stats.totalCore}　額外 ${stats.totalExtra}`,
    },
    {
      label: "完成總數",
      value: stats.completedCount,
      suffix: "",
      color: "text-emerald-600",
      sub: `核心 ${stats.completedCore}　額外 ${stats.completedExtra}`,
    },
    {
      label: "未完成總數",
      value: stats.pendingCount,
      suffix: "",
      color: "text-rose-600",
      sub: `核心 ${stats.pendingCore}　額外 ${stats.pendingExtra}`,
    },
    {
      label: "本週達成率",
      value: stats.coreCompletionRate,
      suffix: "%",
      color: "text-zinc-900",
      sub: "核心任務計算",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((card, index) => (
        <div key={index} className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-xs font-medium text-zinc-500 mb-2">{card.label}</div>
          <div className={cn("text-3xl font-bold", card.color)}>
            {card.value}
            <span className="text-xl font-bold text-zinc-900 ml-0.5">{card.suffix}</span>
          </div>
          {/* 細分說明 */}
          <div className="text-[10px] text-zinc-400 mt-1.5">{card.sub}</div>
        </div>
      ))}
    </div>
  );
}
