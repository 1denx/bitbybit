import { format, parseISO } from "date-fns";
import { cn } from "@/src/lib/utils";
import type { Cycle } from "@/src/types";

interface VisionCardProps {
  cycle: Cycle;
  currentWeekNumber: number;
}

export function VisionCard({ cycle, currentWeekNumber }: VisionCardProps) {
  const startDateLabel = format(parseISO(cycle.start_date), "yyyy/MM/dd");
  const endDateLabel = format(parseISO(cycle.end_date), "yyyy/MM/dd");

  const statusConfig = {
    active: {
      label: "進行中",
      className: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    },
    planning: { label: "規劃中", className: "bg-sky-50 text-sky-600 border border-sky-200" },
    completed: { label: "已完成", className: "bg-zinc-100 text-zinc-500 border border-zinc-200" },
  };

  const statusDisplay = statusConfig[cycle.status] ?? statusConfig.planning;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 border-l-[3px] border-l-zinc-900">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="text-xs text-zinc-400 mb-1">本週期願景</div>
          <h2 className="text-base font-bold text-zinc-900 leading-snug">
            {cycle.vision ?? cycle.name}
          </h2>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[10px] font-medium shrink-0",
            statusDisplay.className,
          )}
        >
          {statusDisplay.label}
        </span>
      </div>
      <div className="text-[10px] text-zinc-400">
        {startDateLabel} - {endDateLabel}
        <span className="mx-2">·</span>
        <span className="font-semibold text-zinc-600">
          W{String(currentWeekNumber).padStart(2, "0")} / W12
        </span>
      </div>
    </div>
  );
}
