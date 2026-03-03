// Supabase 資料庫型別 (對應 DB schema)

export type CycleStatus = "planning" | "active" | "completed";
export type GoalPriority = "main" | "sub";
export type TaskCategory = "core" | "extra";
export type TaskPriority = "urgent_important" | "important" | "urgent" | "normal";
export type InstanceStatus = "unscheduled" | "scheduled" | "completed" | "expired";
export type Frequency = "daily" | "1" | "2" | "3" | "4" | "5" | "6";

export interface UserProfile {
  id: string;
  display_name: string;
  created_at: string;
  updated_at: string;
}

export interface Cycle {
  id: string;
  user_id: string;
  name: string;
  vision: string | null;
  start_date: string; // date string ex:"2026-02/24"
  end_date: string; // start_date + 83 days
  status: CycleStatus;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  cycle_id: string;
  title: string;
  priority: GoalPriority;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  goal_id: string;
  cycle_id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  scheduled_weeks: number[];
  frequency: Frequency;
  note: string | null;
  create_at: string;
  updated_at: string;
}

export interface TaskInstance {
  id: string;
  user_id: string;
  task_id: string;
  goal_id: string;
  cycle_id: string;
  week_number: number;
  scheduled_date: string | null;
  scheduled_start_time: string | null;
  scheduled_end_time: string | null;
  status: InstanceStatus;
  completed_at: string | null;
  is_expired_auto: boolean;
  created_at: string;
  updated_at: string;
}

export interface WeeklyReview {
  id: string;
  user_id: string;
  cycle_id: string;
  week_number: number;
  content: string;
  submitted_at: string;
  updated_at: string;
}
