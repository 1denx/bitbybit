"use client";

import { useState, useEffect } from "react";
import { LockKeyhole, Star } from "lucide-react";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import type { WeekReview, SaveReviewInput } from "@/src/hooks/useWeekReview";
import { format, parseISO } from "date-fns";

interface ReviewFormProps {
  review: WeekReview | null;
  isLocked: boolean;
  isLoading: boolean;
  isSaving: boolean;
  weekNumber: number;
  weekEndDate: string;
  onSave: (input: SaveReviewInput) => Promise<boolean>;
}

export function ReviewForm({
  review,
  isLocked,
  isLoading,
  isSaving,
  weekNumber,
  weekEndDate,
  onSave,
}: ReviewFormProps) {
  const [execution, setExecution] = useState("");
  const [learning, setLearning] = useState("");
  const [reflection, setReflection] = useState("");
  const [mood, setMood] = useState<number | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 載入已有回顧內容
  useEffect(() => {
    if (review) {
      setExecution(review.execution ?? review.content ?? "");
      setLearning(review.learning ?? "");
      setReflection(review.reflection ?? "");
      setMood(review.mood ?? null);
      setIsDirty(false);
      setIsEditing(false);
    } else {
      setExecution("");
      setLearning("");
      setReflection("");
      setMood(null);
      setIsEditing(false);
    }
  }, [review]);

  const handleChange = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setIsDirty(true);
  };

  const handleSave = async () => {
    const success = await onSave({ execution, learning, reflection, mood });
    if (success) {
      setIsDirty(false);
      setIsEditing(false);
    }
  };

  const dateLabel = format(parseISO(weekEndDate), "M/d");

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
            <div className="text-xs text-zinc-400 mt-1">
              {dateLabel}（週日）結束時回顧整週，讓反思更完整
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 已填寫且非編輯模式:顯示唯讀
  if (review && !isEditing) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-bold text-zinc-700">W{weekNumber} 本週回顧</div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">
              {format(parseISO(review.updated_at), "M/d")} 填寫
            </span>
            <span className="text-xs border border-emerald-200 bg-emerald-50 text-emerald-500 px-2 py-1 rounded-full font-medium hidden sm:block">
              已完成
            </span>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setIsEditing(true)}
            >
              編輯
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {review.execution && (
            <div>
              <div className="text-xs text-zinc-400 mb-1.5">本週執行內容</div>
              <div className="text-sm text-zinc-700 bg-zinc-100 rounded-lg p-3 leading-relaxed">
                {review.execution}
              </div>
            </div>
          )}
          {review.learning && (
            <div>
              <div className="text-xs text-zinc-400 mb-1.5">學習與成長</div>
              <div className="text-sm text-zinc-700 bg-zinc-100 rounded-lg p-3 leading-relaxed">
                {review.learning}
              </div>
            </div>
          )}
          {review.reflection && (
            <div>
              <div className="text-xs text-zinc-400 mb-1.5">自我反思</div>
              <div className="text-sm text-zinc-700 bg-zinc-100 rounded-lg p-3 leading-relaxed">
                {review.reflection}
              </div>
            </div>
          )}
          {review.mood !== null && (
            <div>
              <div className="text-xs text-zinc-400 mb-1.5">本週整體感受</div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    size={12}
                    className={
                      star <= (review.mood ?? 0) ? "text-zinc-500 fill-zinc-500" : "text-zinc-200"
                    }
                  />
                ))}
                <span className="text-xs text-zinc-500 ml-1">{review.mood}/5</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 填寫 / 編輯模式
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-bold text-zinc-700">W{weekNumber} 本週回顧</div>
        {isEditing && (
          <Button
            variant="default"
            size="sm"
            className="text-xs"
            onClick={() => {
              setIsEditing(false);
              setIsDirty(false);
            }}
          >
            取消
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>本週執行內容</Label>
          <Textarea
            value={execution}
            onChange={e => handleChange(setExecution)(e.target.value)}
            placeholder="這週完成了什麼？"
            className="min-h-24 text-sm resize-none"
            disabled={isSaving || isLoading}
          />
        </div>

        <div className="space-y-1.5">
          <Label>學習與成長</Label>
          <Textarea
            value={learning}
            onChange={e => handleChange(setLearning)(e.target.value)}
            placeholder="這週學到了什麼？"
            className="min-h-24 text-sm resize-none"
            disabled={isSaving || isLoading}
          />
        </div>

        <div className="space-y-1.5">
          <Label>自我反思與未完成原因</Label>
          <Textarea
            value={reflection}
            onChange={e => handleChange(setReflection)(e.target.value)}
            placeholder="未完成的原因是...下週打算..."
            className="min-h-24 text-sm resize-none"
            disabled={isSaving || isLoading}
          />
        </div>

        {/* 評分 */}
        <div className="space-y-1.5">
          <Label>本週整體感受</Label>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                type="button"
                key={star}
                onClick={() => {
                  setMood(star);
                  setIsDirty(true);
                }}
                disabled={isSaving}
                className="p-0.5 transition-transform hover:scale-110 cursor-pointer"
              >
                <Star
                  size={22}
                  className={
                    star <= (mood ?? 0)
                      ? "text-zinc-900 fill-zinc-900"
                      : "text-zinc-200 hover:text-zinc-300"
                  }
                />
              </button>
            ))}
            {mood && <span className="text-xs text-zinc-400 ml-1">{mood}/5</span>}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between mt-5 gap-4">
        <span className="text-xs text-zinc-400">送出後計入儀表板每週回顧次數</span>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={
            isSaving || (!execution.trim() && !learning.trim() && !reflection.trim()) || !isDirty
          }
        >
          {isSaving ? "儲存中..." : review ? "更新回顧" : "送出本週回顧"}
        </Button>
      </div>
    </div>
  );
}
