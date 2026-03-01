import { useCallback } from "react";
import { createClient } from "../lib/supabase/client";
import { useCycleStore } from "../store/cycleStore";
import { useAuth } from "./useAuth";
import { calcEndDate } from "../lib/utils/weekNumber";
import type { Cycle, CycleStatus } from "../types";
import { toast } from "sonner";

export interface CreateCycleInput {
  name: string;
  vision: string;
  start_date: string;
}

export interface UpdateCycleInput {
  name?: string;
  vision?: string;
  start_date?: string;
}

export function useCycles() {
  const supabase = createClient();
  const { user } = useAuth();
  const {
    cycles,
    activeCycle,
    isLoading,
    setCycles,
    setActiveCycle,
    setIsLoading,
    addCycle,
    updateCycle,
    removeCycle,
  } = useCycleStore();

  // 取得所有週期
  const fetchCycles = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("cycles")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCycles(data ?? []);

      // 設定 activeCycle
      const active = data?.find(cycle => cycle.status === "active") ?? null;
      setActiveCycle(active);
    } catch (error) {
      console.error("fetchCycles ERROR:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 新增週期
  const createCycle = async (input: CreateCycleInput): Promise<boolean> => {
    if (!user) return false;
    try {
      const supabase = createClient();
      const endDate = calcEndDate(new Date(input.start_date));

      const payload = {
        user_id: user.id,
        name: input.name,
        vision: input.vision,
        start_date: input.start_date,
        end_date: endDate.toISOString().split("T")[0],
        status: "planning",
      };

      console.log("insert payload:", payload);

      const { data, error } = await supabase.from("cycles").insert(payload).select().single();

      if (error) {
        console.log("supabase error:", error);
        throw error;
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  // 編輯週期
  const editCycle = async (id: string, input: UpdateCycleInput): Promise<boolean> => {
    try {
      const updates: Record<string, unknown> = { ...input };
      if (input.start_date) {
        const endDate = calcEndDate(new Date(input.start_date));
        updates.end_date = endDate.toISOString().split("T")[0];
      }

      const { data, error } = await supabase
        .from("cycles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      updateCycle(id, data);
      toast.success("週期已更新");

      return true;
    } catch (error) {
      console.error("editCycle ERROR:", error);
      toast.error("更新失敗，請再試一次");
      return false;
    }
  };

  // 更新週期狀態
  const updateStatus = async (id: string, status: CycleStatus): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("cycles")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      updateCycle(id, data);
      if (status === "active") {
        setActiveCycle(data);
      } else if (activeCycle?.id === id) {
        setActiveCycle(null);
      }

      const message: Record<CycleStatus, string> = {
        active: "進行中",
        planning: "規劃中",
        completed: "已完成",
      };

      toast.success(message[status]);
      return true;
    } catch (error) {
      console.error("updateStatus ERROR:", error);
      toast.error("操作失敗，請再試一次");
      return false;
    }
  };

  // 刪除週期
  const deleteCycle = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("cycles").delete().eq("id", id);

      if (error) throw error;
      removeCycle(id);
      toast.success("週期已刪除");

      return true;
    } catch (error) {
      console.error("deleteCycle ERROR:", error);
      toast.error("刪除失敗，請再試一次");
      return false;
    }
  };

  // 檢查週期是否至少有一個目標
  const checkHasGoals = async (cycleId: string): Promise<boolean> => {
    const { count } = await supabase
      .from("goals")
      .select("id", { count: "exact", head: true })
      .eq("cycle_id", cycleId);

    return (count ?? 0) > 0;
  };

  return {
    cycles,
    activeCycle,
    isLoading,
    fetchCycles,
    createCycle,
    editCycle,
    updateCycle,
    updateStatus,
    deleteCycle,
    checkHasGoals,
  };
}
