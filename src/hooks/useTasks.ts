import { useCallback } from "react";
import { createClient } from "../lib/supabase/client";
import { useTaskStore } from "../store/taskStore";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import type { Task, TaskPriority, TaskCategory, Frequency } from "../types";

export interface CreateTaskInput {
  cycle_id: string;
  goal_id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  scheduled_weeks: number[];
  frequency: Frequency;
  note?: string;
}

export interface UpdateTaskInput {
  title?: string;
  category?: TaskCategory;
  priority?: TaskPriority;
  scheduled_weeks?: number[];
  frequency?: Frequency;
  note?: string;
}

export function useTasks() {
  const supabase = createClient();
  const { user } = useAuth();
  const { tasks, isLoading, setTasks, setIsLoading, addTask, updateTask, removeTask } =
    useTaskStore();

  // 取得指定目標的所有任務
  const fetchTasksByGoal = useCallback(
    async (goalId: string) => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)
          .eq("goal_id", goalId)
          .order("created_at", { ascending: true });

        if (error) throw error;

        const newTasks = data ?? ([] as Task[]);
        setTasks([...tasks.filter(existingTask => existingTask.goal_id !== goalId), ...newTasks]);
      } catch (error) {
        console.error("fetchTaskByGoal ERROR:", error);
      }
    },
    [user, tasks],
  );

  // 取得指定週期的所有任務
  const fetchTaskByCycle = useCallback(
    async (cycleId: string) => {
      if (!user) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("user_id", user.id)
          .eq("cycle_id", cycleId)
          .order("created_at", { ascending: true });

        if (error) throw error;
        setTasks((data ?? []) as Task[]);
      } catch (error) {
        console.error("fetchTasksByCycle ERROR:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [user, tasks],
  );

  // 新增任務
  const createTask = async (input: CreateTaskInput): Promise<Task | null> => {
    if (!user) return null;

    const payload = {
      user_id: user.id,
      cycle_id: input.cycle_id,
      goal_id: input.goal_id,
      title: input.title.trim(),
      category: input.category,
      priority: input.priority,
      scheduled_weeks: input.scheduled_weeks,
      frequency: input.frequency,
      note: input.note?.trim() || null,
    };

    try {
      const { data, error } = await supabase.from("tasks").insert(payload).select().single();

      if (error) throw error;
      const newTask = data as Task;
      addTask(newTask);
      toast.success("任務已建立");
      return newTask;
    } catch (error) {
      console.error("createTask ERROR:", error);
      toast.error("任務建立失敗，請再試一次");
      return null;
    }
  };

  // 編輯任務
  const editTask = async (taskId: string, input: UpdateTaskInput): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .update(input)
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;
      updateTask(taskId, data as Task);
      toast.success("任務更新成功");
      return true;
    } catch (error) {
      console.error("editTask ERROR:", error);
      toast.error("任務更新失敗");
      return false;
    }
  };

  // 刪除任務
  const deleteTask = async (taskId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) throw error;
      removeTask(taskId);
      toast.success("刪除任務成功");
      return true;
    } catch (error) {
      console.error("deleteTask ERROR:", error);
      toast.error("任務刪除失敗，請再試一次");
      return false;
    }
  };

  // 依 goalId 篩選任務
  const getTasksByGoal = (goalId: string): Task[] => {
    return tasks.filter(task => task.goal_id === goalId);
  };

  return {
    tasks,
    isLoading,
    fetchTaskByCycle,
    fetchTasksByGoal,
    createTask,
    editTask,
    deleteTask,
    getTasksByGoal,
  };
}
