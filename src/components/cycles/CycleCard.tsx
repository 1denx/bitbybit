"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Play, CheckCircle, RotateCcw, Pencil, Trash2, Target } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { WeekProgressBar } from "./weekProgressBar";
import { useCycles } from "@/src/hooks/useCycles";
import { getCurrentWeekNumber, formatDateRange } from "@/src/lib/utils/weekNumber";
import { cn } from "@/src/lib/utils";
import type { Cycle } from "@/src/types";

interface CycleCardProps {
  cycle: Cycle;
  goalCount: number;
  onEdit: (cycle: Cycle) => void;
}

const statusConfig = {
  planning: {
    label: "規劃中",
    className: "bg-sky-50 text-sky-600 border border-sky-200",
  },
  active: {
    label: "進行中",
    className: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  },
  completed: {
    label: "已完成",
    className: "bg-zinc-100 text-zinc-500 border border-zinc-200",
  },
};

export function CycleCard({ cycle, goalCount, onEdit }: CycleCardProps) {
  const router = useRouter();
  const { updateStatus, deleteCycle, checkHasGoals } = useCycles();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [noGoalOpen, setNoGoalOpen] = useState(false);
  const [isActing, setIsActing] = useState(false);

  const currentWeek = getCurrentWeekNumber(cycle.start_date);
  const status = statusConfig[cycle.status];

  const handleStart = async () => {
    setIsActing(true);
    const hasGoal = await checkHasGoals(cycle.id);
    if (!hasGoal) {
      setNoGoalOpen(true);
      setIsActing(false);
      return;
    }
    await updateStatus(cycle.id, "active");
    setIsActing(false);
  };

  const handleComplete = async () => {
    setIsActing(true);
    await updateStatus(cycle.id, "completed");
    setIsActing(false);
  };

  const handleReopen = async () => {
    setIsActing(true);
    await updateStatus(cycle.id, "active");
    setIsActing(false);
  };

  const handleDelete = async () => {
    await deleteCycle(cycle.id);
    setDeleteOpen(false);
  };

  return (
    <>
      <div
        className={cn(
          "rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md",
          cycle.status === "active" && "border-l-4 border-l-emerald-400",
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-zinc-900 truncate">{cycle.name}</h3>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                  status.className,
                )}
              >
                {status.label}
              </span>
            </div>
            {cycle.vision && <p className="text-sm text-zinc-500 truncate">願景：{cycle.vision}</p>}
          </div>

          {/* Dropdown 選單 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8 shrink-0 text-zinc-400">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-25">
              <DropdownMenuItem onClick={() => onEdit(cycle)}>
                <Pencil size={13} className="mr-1" />
                編輯
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-rose-500 focus:text-rose-500 focus:bg-rose-50"
              >
                <Trash2 size={13} className="mr-1" />
                刪除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 日期 + 週次 */}
        <div className="flex items-center gap-3 mb-3 text-xs text-zinc-400">
          <span>{formatDateRange(cycle.start_date, cycle.end_date)}</span>
          {cycle.status === "active" && currentWeek && (
            <>
              <span>·</span>
              <span className="font-medium text-zinc-600">
                W{String(currentWeek).padStart(2, "0")} / W12
              </span>
            </>
          )}
          {goalCount > 0 && (
            <>
              <span>·</span>
              <span>{goalCount} 個目標</span>
            </>
          )}

          {/* 進度條 */}
          <WeekProgressBar
            currentWeek={cycle.status === "active" ? currentWeek : null}
          ></WeekProgressBar>

          {/* Action 按鈕 */}
          <div className="flex items-center j gap-2 mt-4">
            {cycle.status === "planning" && (
              <>
                <Button size="sm" onClick={handleStart} disabled={isActing}>
                  <Play size={13} className="mr-1.5" />
                  開始執行
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-sky-600 border-sky-200 hover:bg-sky-50 hover:text-sky-700"
                  onClick={() => router.push("/goals")}
                >
                  <Target size={13} className="mr-1.5" />
                  前往新增目標
                </Button>
              </>
            )}
            {cycle.status === "active" && (
              <Button
                size="sm"
                variant="outline"
                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                onClick={handleComplete}
                disabled={isActing}
              >
                <CheckCircle size={13} className="mr-1.5" />
                標記完成
              </Button>
            )}
            {cycle.status === "completed" && (
              <Button
                size="sm"
                variant="outline"
                className="text-zinc-500 border-zinc-200 hover:bg-zinc-50"
                onClick={handleReopen}
                disabled={isActing}
              >
                <RotateCcw size={13} className="mr-1.5" />
                重新開啟
              </Button>
            )}
          </div>
        </div>

        {/* 刪除確認 */}
        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>確定要刪除這個週期嗎？</AlertDialogTitle>
              <AlertDialogDescription>
                刪除後，此週期底下的所有目標與任務也會一併刪除，且無法復原。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-rose-500 text-white hover:bg-rose-600"
              >
                確認刪除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 無目標時的提示 */}
        <AlertDialog open={noGoalOpen} onOpenChange={setNoGoalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>尚未建立目標</AlertDialogTitle>
              <AlertDialogDescription>開始執行前，請至少新增一個目標。</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>稍後再說</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setNoGoalOpen(false);
                  router.push("/goals");
                }}
                className="bg-zinc-900 text-white hover:bg-zinc-700"
              >
                前往新增目標
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
