"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useTasks } from "@/src/hooks/useTasks";
import { PRIORITY_OPTIONS, FREQUENCY_OPTIONS } from "@/src/lib/utils/priority";
import { cn } from "@/src/lib/utils";
import type { Task, TaskPriority, TaskCategory, Frequency } from "@/src/types";
import { ta } from "date-fns/locale";

const ALL_WEEKS = Array.from({ length: 12 }, (_, i) => i + 1);

interface EditTaskModalProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
}

export function EditTaskModal({ open, onClose, task }: EditTaskModalProps) {
  const { editTask } = useTasks();

  const [taskTitle, setTaskTitle] = useState("");
  const [category, setCategory] = useState<TaskCategory>("core");
  const [priority, setPriority] = useState<TaskPriority>("urgent_important");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>(ALL_WEEKS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // task 變更時填入初始值
  useEffect(() => {
    if (task) {
      setTaskTitle(task.title);
      setCategory(task.category);
      setPriority(task.priority);
      setFrequency(task.frequency);
      setSelectedWeeks(task.scheduled_weeks);
    }
  }, [task]);

  const toggleWeek = (week: number) => {
    setSelectedWeeks(prev =>
      prev.includes(week) ? prev.filter(w => w !== week) : [...prev, week].sort((a, b) => a - b),
    );
  };

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!task || !taskTitle.trim()) return;
    setIsSubmitting(true);

    await editTask(task.id, {
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
      <DialogContent className="sm:max-w-sm" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>編輯任務</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="taskTitle">
              任務名稱 <span className="text-rose-400">*</span>
            </Label>
            <Input
              id="taskTitle"
              placeholder="輸入任務名稱"
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">任務類別</Label>
              <Select
                value={category}
                onValueChange={v => setCategory(v as TaskCategory)}
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
                onValueChange={v => setPriority(v as TaskPriority)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">執行頻率</Label>
            <div className="flex flex-wrap gap-1.5">
              {FREQUENCY_OPTIONS.map(opt => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setFrequency(opt.value as Frequency)}
                  disabled={isSubmitting}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                    frequency === opt.value
                      ? "bg-zinc-900 text-white"
                      : "bg-white border border-zinc-200 text-zinc-500 hover:border-zinc-400",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">執行週數</Label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedWeeks(ALL_WEEKS)}
                  className="text-xs text-zinc-400 hover:text-zinc-500 underline cursor-pointer"
                >
                  全選
                </button>
                <span className="text-zinc-200">｜</span>
                <button
                  type="button"
                  onClick={() => setSelectedWeeks([])}
                  className="text-xs text-zinc-400 hover:text-zinc-500 underline cursor-pointer"
                >
                  清除
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {ALL_WEEKS.map(week => (
                <button
                  type="button"
                  key={week}
                  onClick={() => toggleWeek(week)}
                  disabled={isSubmitting}
                  className={cn(
                    "w-7 h-7 rounded text-xs font-medium transition-colors cursor-pointer",
                    selectedWeeks.includes(week)
                      ? "bg-zinc-900 text-white"
                      : "bg-white border border-zinc-200 text-zinc-400 hover:border-zinc-400",
                  )}
                >
                  {week}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting || !taskTitle.trim()}>
              {isSubmitting ? "更新中..." : "儲存變更"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
