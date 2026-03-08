"use client";

import { useEffect, useState } from "react";
import { format, addDays } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useCycles } from "@/src/hooks/useCycles";
import type { Cycle } from "@/src/types";

interface CycleModalProps {
  open: boolean;
  onClose: () => void;
  editTarget: Cycle | null; // 有值 = 編輯模式，null = 新增模式
}

const today = format(new Date(), "yyyy-MM-dd");

export function CycleModal({ open, onClose, editTarget }: CycleModalProps) {
  const { createCycle, editCycle } = useCycles();
  const isEdit = !!editTarget;

  const [name, setName] = useState("");
  const [vision, setVision] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 編輯模式
  useEffect(() => {
    if (editTarget) {
      setName(editTarget.name);
      setVision(editTarget.vision ?? "");
      setStartDate(editTarget.start_date);
    } else {
      setName("");
      setVision("");
      setStartDate(today);
    }
  }, [editTarget, open]);

  // 預覽結束日
  const previewEndDate = startDate ? format(addDays(new Date(startDate), 83), "yyyy/MM/dd") : "-";

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!name.trim() || !startDate) return;

    setIsSubmitting(true);
    let success = false;

    if (isEdit && editTarget) {
      success = await editCycle(editTarget.id, {
        name: name.trim(),
        vision: vision.trim(),
        start_date: startDate,
      });
    } else {
      success = await createCycle({
        name: name.trim(),
        vision: vision.trim(),
        start_date: startDate,
      });
    }

    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{isEdit ? "編輯週期" : "新增週期"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* 週期名稱 */}
          <div className="space-y-1.5">
            <Label htmlFor="name">
              週期名稱 <span className="text-rose-400">*</span>
            </Label>
            <Input
              id="name"
              placeholder="例：2026 Q2 成長計畫"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* 起始日期 */}
          <div className="space-y-1.5">
            <Label htmlFor="startDate">
              起始日期 <span className="text-rose-400">*</span>
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-zinc-400">結束日期（自動計算）：{previewEndDate}</p>
          </div>

          {/* 願景 */}
          <div className="space-y-1.5">
            <Label htmlFor="vision">願景</Label>
            <Textarea
              id="vision"
              placeholder="這 12 週你想達成什麼？"
              value={vision}
              onChange={e => setVision(e.target.value)}
              disabled={isSubmitting}
              className="resize-none"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim() || !startDate}>
              {isSubmitting ? "處理中..." : isEdit ? "儲存變更" : "建立週期"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
