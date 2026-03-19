"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ChevronDown, CircleCheck } from "lucide-react";
import { WeekRateChart } from "./WeekRateChart";
import { cn } from "@/src/lib/utils";
import type { CycleHistory } from "@/src/hooks/useHistoryStats";

const PERFORMANCE_LEGEND = [
  { color: "bg-emerald-400", label: "85% 以上：執行力極佳" },
  { color: "bg-sky-400", label: "70-84%：進展良好" },
  { color: "bg-amber-400", label: "50-69%：需要改進" },
  { color: "bg-rose-400", label: "<50%：調整策略" },
];

interface HistoryCardProps {
  history: CycleHistory;
}

export function HistoryCard({ history }: HistoryCardProps) {
  const { cycle, weekRates, avgRate } = history;
  const [isExpanded, setIsExpanded] = useState(false);

  const startLabel = format(parseISO(cycle.start_date), "yyyy/MM/dd");
  const endLabel = format(parseISO(cycle.end_date), "yyyy/MM/dd");

  return (
    <div className="flex gap-4">
      {/* 績效指標說明 */}
      {isExpanded && (
        <div className="w-44 shrink-0 rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-xs font-semibold text-zinc-700 mb-3">績效指標</div>
          <div className="space-y-2">
            {PERFORMANCE_LEGEND.map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", item.color)} />
                <span className="text-[10px] text-zinc-500">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 週期卡片 */}
      <div
        className={cn(
          "flex-1 rounded-xl border border-zinc-200 bg-white p-5 cursor-pointer",
          "transition-shadow hover:shadow-sm",
        )}
        onClick={() => setIsExpanded(prev => !prev)}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-base font-bold text-zinc-800">{cycle.name}</div>
            <div className="text-xs text-zinc-400 mt-0.5">
              {startLabel} – {endLabel}
            </div>
            {cycle.vision && (
              <div className="text-xs text-zinc-500 mt-1 max-w-lg truncate">{cycle.vision}</div>
            )}
          </div>

          <div className="flex items-start gap-2 shrink-0">
            <div className="flex flex-col items-center gap-3">
              {/* 完成勾勾 */}
              <CircleCheck size={32} className="text-emerald-500" />
              {/* 收何時顯示 AVG 小標籤 */}
              {!isExpanded && avgRate !== null && (
                <span className="text-xs text-zinc-500">AVG {avgRate}%</span>
              )}
            </div>
            <ChevronDown
              size={15}
              className={cn(
                "text-zinc-400 transition-transform duration-200",
                isExpanded && "rotate-180",
              )}
            />
          </div>
        </div>

        {/* 展開後顯示達成率色塊 */}
        {isExpanded && (
          <div className="mt-3 pt-1 border-t" onClick={e => e.stopPropagation()}>
            <WeekRateChart weekRates={weekRates} avgRate={avgRate} />
          </div>
        )}
      </div>
    </div>
  );
}
