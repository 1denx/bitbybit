"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useTasks } from "@/src/hooks/useTasks";
import { useGoals } from "@/src/hooks/useGoals";
import { useCycles } from "@/src/hooks/useCycles";
import { PRIORITY_CONFIG, FREQUENCY_OPTIONS, PRIORITY_OPTIONS } from "@/src/lib/utils/priority";
import { cn } from "@/src/lib/utils";
import type { TaskPriority, TaskCategory, Frequency } from "@/src/types";

const ALL_WEEKS = Array.from({ length: 12 }, (_, index) => index + 1);

interface TaskQuickCreateModalProps {
  open: boolean;
  onClose: () => void;
}

export function TaskQuickCreateModal({ open, onClose }: TaskQuickCreateModalProps) {
  const { createTask } = useTasks();
  const { goals, fetchGoalsByCycle } = useGoals();
  const { cycles } = useCycles();

  const activeCycle =
    cycles.find(cycle => cycle.status === "active") ??
    cycles.find(cycle => cycle.status === "planning") ??
    null;

  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [taskTitle, setTaskTitle] = useState("");
  const [category, setCategory] = useState<TaskCategory>("core");
  const [priority, setPriority] = useState<TaskPriority>("urgent_important");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>(ALL_WEEKS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 開啟時載入目標列表
  useEffect(() => {
    if (open && activeCycle) {
      fetchGoalsByCycle(activeCycle.id);
    }
  }, [open, activeCycle?.id]);

  // 有目標時預設選第一個
  useEffect(() => {
    if (goals.length > 0 && !selectedGoalId) {
      setSelectedGoalId(goals[0].id);
    }
  }, [goals]);

  const handleClose = () => {
    setSelectedGoalId("");
    setTaskTitle("");
    setCategory("core");
    setPriority("urgent_important");
    setFrequency("daily");
    setSelectedWeeks(ALL_WEEKS);
    onClose();
  };

  const toggleWeek = (weekNumber: number) => {
    setSelectedWeeks(previousWeeks =>
      previousWeeks.includes(weekNumber)
        ? previousWeeks.filter(week => week !== weekNumber)
        : [...previousWeeks, weekNumber].sort((weekA, weekB) => weekA - weekB),
    );
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !selectedGoalId || !activeCycle) return;
    setIsSubmitting(true);

    await createTask({
      goal_id: selectedGoalId,
      cycle_id: activeCycle.id,
      title: taskTitle.trim(),
      category,
      priority,
      frequency,
      scheduled_weeks: selectedWeeks,
    });
    setIsSubmitting(false);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xs sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>快速新增任務</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* 所屬目標 */}
          <div className="space-y-1.5">
            <Label>
              所屬目標 <span className="text-rose-400">*</span>
            </Label>
            <Select
              value={selectedGoalId}
              onValueChange={setSelectedGoalId}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="選擇目標" />
              </SelectTrigger>
              <SelectContent>
                {goals.map(goal => (
                  <SelectItem key={goal.id} value={goal.id}>
                    {goal.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 任務名稱 */}
          <div className="space-y-1.5">
            <Label htmlFor="quickTaskTitle">
              任務名稱 <span className="text-rose-400">*</span>
            </Label>
            <Input
              id="quickTaskTitle"
              placeholder="輸入任務名稱"
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              required
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {/* 類別 + 優先級 */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">任務類別</Label>
              <Select
                value={category}
                onValueChange={value => setCategory(value as TaskCategory)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="core">核心任務</SelectItem>
                  <SelectItem value="extra">額外任務</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">優先級</Label>
              <Select
                value={priority}
                onValueChange={value => setPriority(value as TaskPriority)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map(priorityOption => (
                    <SelectItem key={priorityOption.value} value={priorityOption.value}>
                      {priorityOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 執行頻率 */}
          <div className="space-y-1.5">
            <Label className="text-xs">執行頻率</Label>
            <div className="flex flex-wrap gap-1.5">
              {FREQUENCY_OPTIONS.map(frequencyOption => (
                <button
                  type="button"
                  key={frequencyOption.value}
                  onClick={() => setFrequency(frequencyOption.value as Frequency)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                    frequency === frequencyOption.value
                      ? "bg-zinc-900 text-white"
                      : "bg-white border border-zinc-200 text-zinc-500 hover:border-zinc-400",
                  )}
                >
                  {frequencyOption.label}
                </button>
              ))}
            </div>
          </div>

          {/* 執行週數 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">執行週數</Label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedWeeks(ALL_WEEKS)}
                  className="text-xs text-zinc-400 hover:text-zinc-600 underline cursor-pointer"
                >
                  全選
                </button>
                <span className="text-zinc-200">｜</span>
                <button
                  type="button"
                  onClick={() => setSelectedWeeks([])}
                  className="text-xs text-zinc-400 hover:text-zinc-600 underline cursor-pointer"
                >
                  清除
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {ALL_WEEKS.map(weekNumber => (
                <button
                  type="button"
                  key={weekNumber}
                  onClick={() => toggleWeek(weekNumber)}
                  disabled={isSubmitting}
                  className={cn(
                    "w-7 h-7 rounded text-xs font-medium transition-colors cursor-pointer",
                    selectedWeeks.includes(weekNumber)
                      ? "bg-zinc-900 text-white"
                      : "bg-white border border-zinc-200 text-zinc-400 hover:border-zinc-400",
                  )}
                >
                  {weekNumber}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              取消
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !taskTitle.trim() || !selectedGoalId}
              className="mb-4 sm:mb-0"
            >
              {isSubmitting ? "建立中..." : "建立"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
