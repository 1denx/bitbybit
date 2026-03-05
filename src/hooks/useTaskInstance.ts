import { useCallback } from "react";
import { createClient } from "../lib/supabase/client";
import { useTaskStore } from "../store/taskStore";
import { useAuth } from "./useAuth";
import { format } from "date-fns";
import type { TaskInstance, InstanceStatus } from "../types";
import { ta, tr } from "date-fns/locale";

export interface ScheduleInstanceInput {
  instanceId: string;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
}

export function useTaskInstances() {
  const supabase = createClient();
  const { user } = useAuth();
  const { taskInstances, setTaskInstances, updateInstance } = useTaskStore();

  // 取得指定週期 + 週次的所有 TaskInstances
  const fetchInstancesByWeek = useCallback(
    async (cycleId: string, weekNumber: number) => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("task_instances")
          .select("*")
          .eq("user_id", user.id)
          .eq("cycle_id", cycleId)
          .eq("week_number", weekNumber);

        if (error) throw error;
        setTaskInstances((data ?? []) as TaskInstance[]);
      } catch (error) {
        console.error("fetchInstancesByWeek ERROR:", error);
      }
    },
    [user],
  );

  // 取得今日的 TaskInstances
  const fetchInstancesByDate = useCallback(
    async (cycleId: string, date: Date) => {
      if (!user) return;
      try {
        const dateStr = format(date, "yyyy-MM-dd");
        const { data, error } = await supabase
          .from("task_instances")
          .select("*")
          .eq("user_id", user.id)
          .eq("cycle_id", cycleId)
          .eq("scheduled_date", dateStr);

        if (error) throw error;
        setTaskInstances((data ?? []) as TaskInstance[]);
      } catch (error) {
        console.error("fetchInstancesByDate ERROR:", error);
      }
    },
    [user],
  );

  // 建立 TaskInstance
  const createInstance = async (
    taskId: string,
    goalId: string,
    cycleId: string,
    weekNumber: number,
    scheduledDate: string,
    scheduledStartTime: string,
    scheduledEndTime: string,
  ): Promise<TaskInstance | null> => {
    if (!user) return null;
    try {
      const payload = {
        user_id: user.id,
        task_id: taskId,
        goal_id: goalId,
        cycle_id: cycleId,
        week_number: weekNumber,
        scheduled_date: scheduledDate,
        scheduled_start_time: scheduledStartTime,
        scheduled_end_time: scheduledEndTime,
        status: "scheduled",
      };

      const { data, error } = await supabase
        .from("task_instances")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      const newInstance = data as TaskInstance;

      useTaskStore
        .getState()
        .setTaskInstances([...useTaskStore.getState().taskInstances, newInstance]);
      return newInstance;
    } catch (error) {
      console.error("createInstance ERROR:", error);
      return null;
    }
  };

  // 重新排程
  const rescheduleInstance = async (input: ScheduleInstanceInput): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("task_instances")
        .update({
          scheduled_date: input.scheduledDate,
          scheduled_start_time: input.scheduledStartTime,
          scheduled_end_time: input.scheduledEndTime,
          status: "scheduled",
        })
        .eq("id", input.instanceId)
        .select()
        .single();

      if (error) throw error;
      updateInstance(input.instanceId, data as TaskInstance);
      return true;
    } catch (error) {
      console.error("rescheduleInstance ERROR:", error);
      return false;
    }
  };

  // 標記完成
  const completeInstance = async (instanceId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("task_instances")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", instanceId)
        .select()
        .single();

      if (error) throw error;
      updateInstance(instanceId, data as TaskInstance);
      return true;
    } catch (error) {
      console.error("completedInstance ERROR:", error);
      return false;
    }
  };

  // 取消完成
  const uncompleteInstance = async (instanceId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("task_instances")
        .update({
          status: "scheduled",
          completed_at: null,
        })
        .eq("id", instanceId)
        .select()
        .single();

      if (error) throw error;
      updateInstance(instanceId, data as TaskInstance);
      return true;
    } catch (error) {
      console.error("uncompleteInstance ERROR:", error);
      return false;
    }
  };

  // 刪除 Instance
  const deleteInstance = async (instanceId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.from("task_instances").delete().eq("id", instanceId);

      if (error) throw error;
      useTaskStore
        .getState()
        .setTaskInstances(
          useTaskStore.getState().taskInstances.filter(instance => instance.id !== instanceId),
        );
      return true;
    } catch (error) {
      console.error("deleteInstance ERROR:", error);
      return false;
    }
  };

  // 取得指定日期的 Instance
  const getInstancesByDate = (dateStr: string): TaskInstance[] => {
    return taskInstances.filter(
      instance => instance.scheduled_date === dateStr && instance.status !== "expired",
    );
  };
  // 取得位排程的 instance
  const getUnscheduledInstances = (): TaskInstance[] => {
    return taskInstances.filter(instance => instance.status === "unscheduled");
  };

  // 取得過期的 instance
  const getExpiredInstances = (): TaskInstance[] => {
    return taskInstances.filter(instance => instance.status === "expired");
  };

  return {
    taskInstances,
    fetchInstancesByWeek,
    fetchInstancesByDate,
    createInstance,
    rescheduleInstance,
    completeInstance,
    uncompleteInstance,
    deleteInstance,
    getInstancesByDate,
    getUnscheduledInstances,
    getExpiredInstances,
  };
}
