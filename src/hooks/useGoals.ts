import { useCallback } from "react";
import { createClient } from "../lib/supabase/client";
import { useGoalStore } from "../store/goalStore";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import type { Goal, GoalPriority } from "../types";

export interface CreateGoalInput {
  cycle_id: string;
  title: string;
  priority: GoalPriority;
}

export interface UpdateGoalInput {
  title?: string;
  priority?: GoalPriority;
}

export function useGoals() {
  const supabase = createClient();
  const { user } = useAuth();
  const { goals, isLoading, setGoals, setIsLoading, addGoal, updateGoal, removeGoal } =
    useGoalStore();

  // 取得指定週期所有目標
  const fetchGoalsByCycle = useCallback(
    async (cycleId: string) => {
      if (!user) return;
      setIsLoading(true);
      try {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from("goals")
          .select("*")
          .eq("user_id", user.id)
          .eq("cycle_id", cycleId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setGoals((data ?? []) as Goal[]);
      } catch (error) {
        console.error("fetchGoalsByCycle ERROR:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [user],
  );

  // 新增目標
  const createGoal = async (input: CreateGoalInput): Promise<Goal | null> => {
    if (!user) return null;
    try {
      const payload = {
        user_id: user.id,
        cycle_id: input.cycle_id,
        title: input.title.trim(),
        priority: input.priority,
      };

      const { data, error } = await supabase.from("goals").insert(payload).select().single();

      if (error) throw error;
      const newGoal = data as Goal;
      addGoal(newGoal);
      toast.success("目標已建立");
      return newGoal;
    } catch (error) {
      console.error("createGoal ERROR:", error);
      toast.error("建立失敗，請再試一次");
      return null;
    }
  };

  // 編輯目標
  const editGoal = async (goalId: string, input: UpdateGoalInput): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("goals")
        .update(input)
        .eq("id", goalId)
        .select()
        .single();

      if (error) throw error;

      updateGoal(goalId, data as Goal);
      toast.success("目標已更新");

      return true;
    } catch (error) {
      console.error("editGoal ERROR:", error);
      toast.error("更新失敗，請再次一次");
      return false;
    }
  };

  // 刪除目標
  const deleteGoal = async (goalId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("goals").delete().eq("id", goalId);

      if (error) throw error;
      removeGoal(goalId);
      toast.success("目標已刪除");

      return true;
    } catch (error) {
      console.error("deleteGoal ERROR:", error);
      toast.error("刪除失敗，請再次一次");
      return false;
    }
  };

  return {
    goals,
    isLoading,
    fetchGoalsByCycle,
    createGoal,
    editGoal,
    deleteGoal,
  };
}
