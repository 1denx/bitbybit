import { useState, useEffect, useCallback } from "react";
import { createClient } from "../lib/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface WeekReview {
  id: string;
  cycle_id: string;
  week_number: number;
  content: string;
  execution: string | null;
  learning: string | null;
  reflection: string | null;
  mood: number | null;
  created_at: string;
  updated_at: string;
}

export interface SaveReviewInput {
  execution: string;
  learning: string;
  reflection: string;
  mood: number | null;
}

export function useWeekReview(cycleId: string, weekNumber: number) {
  const supabase = createClient();
  const { user } = useAuth();
  const [review, setReview] = useState<WeekReview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchReview = useCallback(async () => {
    if (!user || !cycleId) return;
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from("week_reviews")
        .select("*")
        .eq("user_id", user.id)
        .eq("cycle_id", cycleId)
        .eq("week_number", weekNumber)
        .maybeSingle();

      setReview(data ?? null);
    } catch (error) {
      console.error("fetchReview ERROR:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, cycleId, weekNumber]);

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  const saveReview = useCallback(
    async (input: SaveReviewInput): Promise<boolean> => {
      if (!user) return false;
      setIsLoading(true);
      try {
        const payload = {
          user_id: user.id,
          cycle_id: cycleId,
          week_number: weekNumber,
          content: input.execution,
          execution: input.execution,
          learning: input.learning,
          reflection: input.reflection,
          mood: input.mood,
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from("week_reviews")
          .upsert(payload, { onConflict: "user_id,cycle_id,week_number" })
          .select()
          .single();

        if (error) throw error;
        setReview(data as WeekReview);
        toast.success("回顧已儲存");
        return true;
      } catch (error) {
        console.error("saveReview ERROR:", error);
        toast.error("儲存失敗，請再試一次");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user, cycleId, weekNumber],
  );
  return { review, isLoading, isSaving, saveReview };
}
