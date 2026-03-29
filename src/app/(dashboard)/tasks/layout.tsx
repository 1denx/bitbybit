"use client";

import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { TasksTabNav } from "@/src/components/layout/TaskTabNav";
import { useUIStore } from "@/src/store/uiStore";
import {
  getThisWeekStart,
  getNextWeekStart,
  getPrevWeekStart,
  formatWeekTitle,
} from "@/src/lib/utils/calendar";
import { TaskQuickCreateModal } from "@/src/components/modals/TaskQuickCreateModal";
import { format, isSameWeek } from "date-fns";
import { useCycles } from "@/src/hooks/useCycles";
import { useEffect } from "react";
import { calcWeekNumberFromDate } from "@/src/hooks/useCurrentWeek";

export default function TaskLayout({ children }: { children: React.ReactNode }) {
  const { cycles, fetchCycles } = useCycles();

  const pathname = usePathname();
  const { currentWeekStart, setCurrentWeekStart, quickAddTaskModalOpen, setQuickAddTaskModalOpen } =
    useUIStore();

  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);

  const activeCycle =
    cycles.find(cycle => cycle.status === "active") ??
    cycles.find(cycle => cycle.status === "planning") ??
    null;

  const isWeekView = pathname === "/tasks/week";
  const isCurrentWeek = isSameWeek(currentWeekStart, new Date(), { weekStartsOn: 1 });

  const isTodayView = pathname === "/tasks/today";
  const todayLabel = format(new Date(), "yyyy/MM/dd　(EEE)");

  const isBoardView = pathname === "/tasks/board";

  const isReviewView = pathname === "/tasks/review";
  const weekNumber = activeCycle
    ? calcWeekNumberFromDate(activeCycle.start_date, currentWeekStart)
    : 1;

  return (
    <div className="flex flex-col h-full">
      {/* TopBar */}
      <div className="relative flex items-center border-b px-4 py-2 bg-white shrink-0 h-12">
        {/* 週導覽 */}
        <div className="hidden sm:flex items-center gap-1">
          {isWeekView && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-zinc-500"
                onClick={() => setCurrentWeekStart(getPrevWeekStart(currentWeekStart))}
              >
                <ChevronLeft size={14} />
              </Button>
              <span className="text-sm font-semibold text-zinc-800 min-w-32.5 text-center">
                {formatWeekTitle(currentWeekStart)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-zinc-500"
                onClick={() => setCurrentWeekStart(getNextWeekStart(currentWeekStart))}
              >
                <ChevronRight size={14} />
              </Button>
              {!isCurrentWeek && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2.5 text-zinc-500 ml-1"
                  onClick={() => setCurrentWeekStart(getThisWeekStart())}
                >
                  Today
                </Button>
              )}
            </div>
          )}

          {/* 今日視圖標題 */}
          {isTodayView && (
            <span className="text-sm font-semibold text-zinc-800 mr-1">{todayLabel}</span>
          )}

          {/* 看板 */}
          {isBoardView && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-zinc-500"
                onClick={() => setCurrentWeekStart(getPrevWeekStart(currentWeekStart))}
              >
                <ChevronLeft size={14} />
              </Button>
              <span className="text-sm font-semibold text-zinc-800 min-w-32.5 text-center">
                {formatWeekTitle(currentWeekStart)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-zinc-500"
                onClick={() => setCurrentWeekStart(getNextWeekStart(currentWeekStart))}
              >
                <ChevronRight size={14} />
              </Button>
              {!isCurrentWeek && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2.5 text-zinc-500 ml-1"
                  onClick={() => setCurrentWeekStart(getThisWeekStart())}
                >
                  Today
                </Button>
              )}
            </div>
          )}

          {/* 回顧 */}
          {isReviewView && (
            <div className="hidden sm:flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-zinc-500"
                onClick={() => setCurrentWeekStart(getPrevWeekStart(currentWeekStart))}
              >
                <ChevronLeft size={14} />
              </Button>
              <span className="text-sm font-semibold text-zinc-800 min-w-32 text-center">
                W{String(weekNumber).padStart(2, "0")} {formatWeekTitle(currentWeekStart)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-zinc-500"
                onClick={() => setCurrentWeekStart(getNextWeekStart(currentWeekStart))}
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </div>

        {/* Tab 切換 */}
        <div className="absolute left-1/2 -translate-x-1/2 -ml-9 sm:ml-0">
          <TasksTabNav />
        </div>

        {/* 新增任務 */}
        <Button
          size="sm"
          className="ml-auto bg-zinc-900 text-white hover:bg-zinc-700 h-8"
          onClick={() => setQuickAddTaskModalOpen(true)}
        >
          <Plus size={13} className="sm:mr-1.5" />
          <span className="hidden sm:block">新增任務</span>
        </Button>
      </div>

      {/* 桌機以下: 週導覽 */}
      {isWeekView && (
        <div className="sm:hidden flex items-center justify-center gap-1 py-2 border-b border-zinc-200">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-500"
            onClick={() => setCurrentWeekStart(getPrevWeekStart(currentWeekStart))}
          >
            <ChevronLeft size={14} />
          </Button>
          <span className="text-sm font-semibold text-zinc-800 min-w-32.5 text-center">
            {formatWeekTitle(currentWeekStart)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-500"
            onClick={() => setCurrentWeekStart(getNextWeekStart(currentWeekStart))}
          >
            <ChevronRight size={14} />
          </Button>
          {!isCurrentWeek && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2.5 text-zinc-500 ml-1"
              onClick={() => setCurrentWeekStart(getThisWeekStart())}
            >
              Today
            </Button>
          )}
        </div>
      )}

      {/* 桌機以下:看板 */}
      {isBoardView && (
        <div className="sm:hidden flex items-center justify-center gap-1 py-2 border-b border-zinc-200">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-500"
            onClick={() => setCurrentWeekStart(getPrevWeekStart(currentWeekStart))}
          >
            <ChevronLeft size={14} />
          </Button>
          <span className="text-sm font-semibold text-zinc-800 min-w-32.5 text-center">
            {formatWeekTitle(currentWeekStart)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-500"
            onClick={() => setCurrentWeekStart(getNextWeekStart(currentWeekStart))}
          >
            <ChevronRight size={14} />
          </Button>
          {!isCurrentWeek && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2.5 text-zinc-500 ml-1"
              onClick={() => setCurrentWeekStart(getThisWeekStart())}
            >
              Today
            </Button>
          )}
        </div>
      )}

      {/* 桌機以下:回顧 */}
      {isReviewView && (
        <div className="sm:hidden flex items-center justify-center gap-1 py-2 border-b border-zinc-20">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-500"
            onClick={() => setCurrentWeekStart(getPrevWeekStart(currentWeekStart))}
          >
            <ChevronLeft size={14} />
          </Button>
          <span className="text-sm font-semibold text-zinc-800 min-w-32 text-center">
            W{String(weekNumber).padStart(2, "0")} {formatWeekTitle(currentWeekStart)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-500"
            onClick={() => setCurrentWeekStart(getNextWeekStart(currentWeekStart))}
          >
            <ChevronRight size={14} />
          </Button>
        </div>
      )}

      <div className="flex-1 overflow-hidden">{children}</div>

      {/* 快速新增 Modal */}
      <TaskQuickCreateModal
        open={quickAddTaskModalOpen}
        onClose={() => setQuickAddTaskModalOpen(false)}
      />
    </div>
  );
}
