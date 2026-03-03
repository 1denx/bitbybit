"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useGoals } from "@/src/hooks/useGoals";
import { useTasks } from "@/src/hooks/useTasks";
import { cn } from "@/src/lib/utils";
import { PRIORITY_OPTIONS, FREQUENCY_OPTIONS } from "@/src/lib/utils/priority";
import type { Goal, Task, TaskPriority, TaskCategory, Frequency } from "@/src/types";

interface DraftTask {
  draftId: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  frequency: Frequency;
  scheduled_weeks: number[];
}

interface GoalModalProps {
  open: boolean;
  onClose: () => void;
  cycleId: string;
  editTarget?: Goal | null;
}

const ALL_WEEKS = Array.from({ length: 12 }, (_, index) => index + 1);

function createEmptyDraftTask(): DraftTask {
  return {
    draftId: crypto.randomUUID(),
    title: "",
    category: "core",
    priority: "urgent_important",
    frequency: "daily",
    scheduled_weeks: ALL_WEEKS,
  };
}

export function GoalModal({ open, onClose, cycleId, editTarget }: GoalModalProps) {
  const isEditMode = !!editTarget;
  const { createGoal, editGoal } = useGoals();
  const { createTask, deleteTask, getTasksByGoal } = useTasks();

  const [goalTitle, setGoalTitle] = useState("");
  const [goalPriority, setGoalPriority] = useState<"main" | "sub">("main");
  const [draftTasks, setDraftTasks] = useState<DraftTask[]>([createEmptyDraftTask()]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 編輯模式
  useEffect(() => {
    if (editTarget) {
      setGoalTitle(editTarget.title);
      setGoalPriority(editTarget.priority);
      setDraftTasks([]);
    } else {
      setGoalTitle("");
      setGoalPriority("main");
      setDraftTasks([createEmptyDraftTask()]);
    }
  }, [editTarget, open]);

  // DraftTask CRUD
  const addDraftTask = () => {
    setDraftTasks(previousDraftTasks => [...previousDraftTasks, createEmptyDraftTask()]);
  };

  const removeDraftTask = (draftId: string) => {
    setDraftTasks(previousDraftTasks =>
      previousDraftTasks.filter(draftTask => draftTask.draftId !== draftId),
    );
  };

  const updateDraftTask = (draftId: string, updates: Partial<DraftTask>) => {
    setDraftTasks(previousDraftTasks =>
      previousDraftTasks.map(draftTask =>
        draftTask.draftId === draftId ? { ...draftTask, ...updates } : draftTask,
      ),
    );
  };

  // 切換週次，判斷是否有無選取
  const toggleWeek = (draftId: string, weekNumber: number) => {
    setDraftTasks(previousDraftTasks =>
      previousDraftTasks.map(draftTask => {
        if (draftTask.draftId !== draftId) return draftTask;

        const alreadySelected = draftTask.scheduled_weeks.includes(weekNumber);
        const updatedWeeks = alreadySelected
          ? draftTask.scheduled_weeks.filter(week => week !== weekNumber)
          : [...draftTask.scheduled_weeks, weekNumber].sort((a, b) => a - b);

        return { ...draftTask, scheduled_weeks: updatedWeeks };
      }),
    );
  };

  const selectAllWeeks = (draftId: string) => {
    updateDraftTask(draftId, { scheduled_weeks: ALL_WEEKS });
  };

  const clearAllWeeks = (draftId: string) => {
    updateDraftTask(draftId, { scheduled_weeks: [] });
  };

  // 送出
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;
    setIsSubmitting(true);

    try {
      if (isEditMode && editTarget) {
        // 編輯模式:只更新目標欄位
        await editGoal(editTarget.id, {
          title: goalTitle.trim(),
          priority: goalPriority,
        });
      } else {
        // 新增模式:建立目標+所有 draft tasks
        const newGoal = await createGoal({
          cycle_id: cycleId,
          title: goalTitle.trim(),
          priority: goalPriority,
        });

        if (newGoal) {
          const validDraftTasks = draftTasks.filter(draftTask => draftTask.title.trim() !== "");
          // 逐一建立任務
          await Promise.all(
            validDraftTasks.map(draftTask =>
              createTask({
                goal_id: newGoal?.id,
                cycle_id: cycleId,
                title: draftTask.title,
                category: draftTask.category,
                priority: draftTask.priority,
                frequency: draftTask.frequency,
                scheduled_weeks: draftTask.scheduled_weeks,
              }),
            ),
          );
        }
      }

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>{isEditMode ? "編輯目標" : "新增目標"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* 目標名稱 */}
          <div className="space-y-1.5">
            <Label htmlFor="goalTitle">
              目標名稱 <span className="text-rose-400">*</span>
            </Label>
            <Input
              id="goalTitle"
              placeholder="例：學習 React + Next.js"
              value={goalTitle}
              onChange={e => setGoalTitle(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* 目標優先級 */}
          <div className="space-y-1.5">
            <Label>目標優先級</Label>
            <div className="flex gap-2">
              {(["main", "sub"] as const).map(priorityOption => (
                <button
                  type="button"
                  key={priorityOption}
                  onClick={() => setGoalPriority(priorityOption)}
                  className={cn(
                    "flex-1 rounded-lg border py-2 text-sm font-medium transition-colors cursor-pointer",
                    goalPriority === priorityOption
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 text-zinc-500 hover:border-zinc-400",
                  )}
                >
                  {priorityOption === "main" ? "主要目標" : "次要目標"}
                </button>
              ))}
            </div>
          </div>

          {/* 任務列表(新增模式才顯示) */}
          {isEditMode && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>任務</Label>
                <span className="text-xs text-zinc-400">{draftTasks.length} 個任務</span>
              </div>

              <div className="space-y-3">
                {draftTasks.map((draftTask, taskIndex) => (
                  <DraftTaskForm
                    key={draftTask.draftId}
                    draftTask={draftTask}
                    taskIndex={taskIndex}
                    onUpdate={updates => updateDraftTask(draftTask.draftId, updates)}
                    onToggleWeek={weekNumber => toggleWeek(draftTask.draftId, weekNumber)}
                    onSelectAll={() => selectAllWeeks(draftTask.draftId)}
                    onClearAll={() => clearAllWeeks(draftTask.draftId)}
                    onRemove={() => removeDraftTask(draftTask.draftId)}
                    canRemove={draftTasks.length > 1}
                    isSubmitting={isSubmitting}
                  />
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed text-zinc-400 hover:text-zinc-600"
                onClick={addDraftTask}
                disabled={isSubmitting}
              >
                <Plus size={13} className="mr-1" /> 新增任務
              </Button>
            </div>
          )}

          {/* 編輯模式:提示去 GoalCard 管理任務 */}
          {isEditMode && (
            <p className="text-xs text-zinc-400 bg-zinc-50 rounded-lg px-3 py-2 border border-zinc-100">
              任務的新增與刪除請直接在目標卡片中操作
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting || !goalTitle.trim()}>
              {isSubmitting ? "處理中..." : isEditMode ? "儲存變更" : "建立目標"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// DraftTaskForm (單一任務)
interface DraftTaskFormProps {
  draftTask: DraftTask;
  taskIndex: number;
  onUpdate: (updates: Partial<DraftTask>) => void;
  onToggleWeek: (weekNumber: number) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onRemove: () => void;
  canRemove: boolean;
  isSubmitting: boolean;
}

function DraftTaskForm({
  draftTask,
  taskIndex,
  onUpdate,
  onToggleWeek,
  onSelectAll,
  onClearAll,
  onRemove,
  canRemove,
  isSubmitting,
}: DraftTaskFormProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 space-y-3">
      {/* 任務標題 */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400">任務 {taskIndex + 1}</span>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="w-6 h-6 text-zinc-400 hover:text-rose-500 hover:bg-rose-50"
            onClick={onRemove}
            disabled={isSubmitting}
          >
            <X size={12} />
          </Button>
        )}
      </div>

      {/* 任務名稱 */}
      <Input
        placeholder="任務名稱"
        value={draftTask.title}
        onChange={e => onUpdate({ title: e.target.value })}
        disabled={isSubmitting}
        className="bg-white"
      />

      {/* 類別 + 優先級 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs text-zinc-400">任務類別</Label>
          <Select
            value={draftTask.category}
            onValueChange={value => onUpdate({ category: value as TaskCategory })}
            disabled={isSubmitting}
          >
            <SelectTrigger className="bg-white h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="core">核心任務</SelectItem>
              <SelectItem value="extra">額外任務</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-zinc-400">優先級</Label>
          <Select
            value={draftTask.priority}
            onValueChange={value => onUpdate({ priority: value as TaskPriority })}
            disabled={isSubmitting}
          >
            <SelectTrigger className="bg-white h-8 text-xs">
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
      <div className="space-y-1">
        <Label className="text-xs text-zinc-400">執行頻率</Label>
        <div className="flex flex-wrap gap-1.5">
          {FREQUENCY_OPTIONS.map(frequencyOption => (
            <button
              type="button"
              key={frequencyOption.value}
              onClick={() => onUpdate({ frequency: frequencyOption.value as Frequency })}
              disabled={isSubmitting}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                draftTask.frequency === frequencyOption.value
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
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-zinc-400">執行週數</Label>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={onSelectAll}
              disabled={isSubmitting}
              className="text-xs text-zinc-400 hover:text-zinc-600 underline "
            >
              全選
            </button>
            <span className="text-zinc-200">｜</span>
            <button
              type="button"
              onClick={onClearAll}
              disabled={isSubmitting}
              className="text-xs text-zinc-400 hover:text-zinc-600 underline"
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
              onClick={() => onToggleWeek(weekNumber)}
              disabled={isSubmitting}
              className={cn(
                "w-7 h-7 rounded text-xs font-medium transition-colors",
                draftTask.scheduled_weeks.includes(weekNumber)
                  ? "bg-zinc-900 text-white"
                  : "bg-white border-zinc-200 text-zinc-400 hover:border-zinc-400",
              )}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
}
