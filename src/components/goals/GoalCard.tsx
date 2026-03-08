"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Pencil, Trash2, Plus, MoreHorizontal } from "lucide-react";
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
import { TaskRow } from "./TaskRow";
import { useGoals } from "@/src/hooks/useGoals";
import { useTasks } from "@/src/hooks/useTasks";
import { cn } from "@/src/lib/utils";
import type { Goal, Task } from "@/src/types";

interface GoalCardProps {
  goal: Goal;
  tasks: Task[];
  cycleId: string;
  onEdit: (goal: Goal) => void;
  onAddTask: (goalId: string) => void;
}

export function GoalCard({ goal, tasks, cycleId, onEdit, onAddTask }: GoalCardProps) {
  const { deleteGoal } = useGoals();
  const { deleteTask } = useTasks();

  const [isExpanded, setIsExpanded] = useState(true);
  const [deleteGoalOpen, setDeleteGoalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const coreTasKCount = tasks.filter(task => task.category === "core").length;
  const extraTaskCount = tasks.filter(task => task.category === "extra").length;

  const handleDeleteGoal = async () => {
    setIsDeleting(true);
    await deleteGoal(goal.id);
    setIsDeleting(false);
    setDeleteGoalOpen(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
  };

  return (
    <>
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        {/* Goal Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100">
          {/* 優先級標示 */}
          <div
            className={cn(
              "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
              goal.priority === "main"
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-500 border border-zinc-200",
            )}
          >
            {goal.priority === "main" ? "主要目標" : "次要目標"}
          </div>

          {/* 目標名稱 */}
          <h3 className="flex-1 font-medium text-zinc-900 truncate">{goal.title}</h3>

          {/* 任務數量 */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 shrink-0">
            {coreTasKCount > 0 && (
              <span className="rounded-full bg-zinc-900 text-white px-2 py-0.5 text-xs">
                核心 {coreTasKCount}
              </span>
            )}
            {extraTaskCount > 0 && (
              <span className="rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200 px-2 py-0.5 text-xs">
                額外 {extraTaskCount}
              </span>
            )}
          </div>

          {/* 展開/收合 */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-zinc-400"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </Button>

          {/* Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-7 h-7 text-zinc-400">
                <MoreHorizontal size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-30">
              <DropdownMenuItem onClick={() => onEdit(goal)}>
                <Pencil size={13} className="mr-1" />
                編輯目標
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddTask(goal.id)}>
                <Plus size={13} className="mr-1" />
                新增任務
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteGoalOpen(true)}
                className="text-rose-500 focus:text-rose-500 focus:bg-rose-50"
              >
                <Trash2 size={13} className="mr-1" />
                刪除目標
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 任務列表 */}
        {isExpanded && (
          <div className="px-5 py-3 space-y-1.5">
            {tasks.length === 0 ? (
              <div className="flex items-center justify-center py-6 text-center">
                <div>
                  <p className="text-sm text-zinc-400 mb-2">尚未建立任何任務</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-dashed text-zinc-400 hover:text-zinc-600"
                    onClick={() => onAddTask(goal.id)}
                  >
                    <Plus size={13} className="mr-1" />
                    新增第一個任務
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {tasks.map(task => (
                  <TaskRow key={task.id} task={task} onDelete={handleDeleteTask} />
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full border border-dashed border-zinc-200 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50"
                  onClick={() => onAddTask(goal.id)}
                >
                  <Plus size={13} className="mr-1" />
                  新增任務
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* 刪除確認 */}
      <AlertDialog open={deleteGoalOpen} onOpenChange={setDeleteGoalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確定要刪除這個目標嗎？</AlertDialogTitle>
            <AlertDialogDescription>
              刪除後，此目標底下所有的任務也會一併刪除，且無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGoal}
              disabled={isDeleting}
              className="bg-rose-500 text-white hover:bg-rose-600"
            >
              確認刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
