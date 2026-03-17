"use client";

import { useState, useEffect } from "react";
import { LockKeyhole } from "lucide-react";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { cn } from "@/src/lib/utils";
import type { WeekReview } from "@/src/hooks/useWeekReview";

interface ReviewFormProps {
  review: WeekReview | null;
  isLocked: boolean;
  isLoading: boolean;
  isSaving: boolean;
  onSave: (content: string) => Promise<boolean>;
}

export function ReviewForm({ review, isLocked, isLoading, isSaving, onSave }: ReviewFormProps) {
  const [content, setContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  // 載入已有回顧內容
  useEffect(() => {
    if (review?.content) {
      setContent(review.content);
    }
  }, [review]);

  const handleChange = (value: string) => {
    setContent(value);
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    const success = await onSave(content.trim());
    if (success) setIsDirty(false);
  };

  // 周日前鎖定狀態
  if (isLocked) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="text-xs font-medium text-zinc-500 mb-4">本週回顧</div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-100 p-4 flex items-center gap-4">
          <span>
            <LockKeyhole size={24} />
          </span>
          <div>
            <div className="text-sm font-semibold text-zinc-700">本週回顧於週日開放填寫</div>
            <div className="text-xs text-zinc-400 mt-1">週日結束時回顧整週，讓反思更完整有效</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs font-semibold text-zinc-600">本週回顧</div>
        {review && !isDirty && <span className="text-[10px] text-emerald-500">✓ 已儲存</span>}
      </div>

      <Textarea
        value={content}
        onChange={e => handleChange(e.target.value)}
        placeholder="這週執行得如何？遇到什麼困難？下週想調整什麼？"
        className="min-h-30 text-sm resize-none border-zinc-200 focus:border-zinc-400 focus:ring-0"
        disabled={isSaving || isLoading}
      />

      <div className="flex items-center justify-between mt-3">
        <span className="text-[10px] text-zinc-300">
          {content.length > 0 && `${content.length} 字`}
        </span>
        <Button size="sm" onClick={handleSave} disabled={isSaving || !content.trim() || !isDirty}>
          {isSaving ? "儲存中..." : review ? "更新回顧" : "送出回顧"}
        </Button>
      </div>
    </div>
  );
}
