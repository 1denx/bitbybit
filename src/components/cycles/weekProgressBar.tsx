import { cn } from "@/src/lib/utils";

interface WeekProgressBarProps {
  currentWeek: number | null;
  totalWeeks?: number;
}

export function WeekProgressBar({ currentWeek, totalWeeks = 12 }: WeekProgressBarProps) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: totalWeeks }, (_, i) => {
        const week = i + 1;
        const isDone = currentWeek !== null && week < currentWeek;
        const isCurrent = currentWeek !== null && week === currentWeek;

        return (
          <div
            key={week}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              isDone && "bg-zinc-700",
              isCurrent && "bg-zinc-400",
              !isDone && "bg-zinc-200",
            )}
          />
        );
      })}
    </div>
  );
}
