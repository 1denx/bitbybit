// Supabase 資料庫型別
// 單一資料來源是 src/types/supabase.ts（由 `npm run db:types` 產生）。
// DB 的 status / priority / category / frequency 是 text + check constraint，
// 產生器只會給 string，所以這裡用 MergeDeep 覆寫成字面量 union，
// 讓查詢結果自動帶有正確的窄型別。
import type { MergeDeep } from "type-fest";
import type { Database as DatabaseGenerated } from "./supabase";

export type CycleStatus = "planning" | "active" | "completed";
export type GoalPriority = "main" | "sub";
export type TaskCategory = "core" | "extra";
export type TaskPriority = "urgent_important" | "important" | "urgent" | "normal";
export type InstanceStatus = "unscheduled" | "scheduled" | "completed" | "expired";
export type Frequency = "daily" | "1" | "2" | "3" | "4" | "5" | "6";

export type Database = MergeDeep<
  DatabaseGenerated,
  {
    public: {
      Tables: {
        cycles: {
          Row: { status: CycleStatus };
        };
        goals: {
          Row: { priority: GoalPriority };
        };
        tasks: {
          Row: { category: TaskCategory; priority: TaskPriority; frequency: Frequency };
        };
        task_instances: {
          Row: { status: InstanceStatus };
        };
      };
    };
  }
>;

type PublicTables = Database["public"]["Tables"];

// 各資料表的 Row / Insert / Update 型別
export type Tables<T extends keyof PublicTables> = PublicTables[T]["Row"];
export type TablesInsert<T extends keyof PublicTables> = PublicTables[T]["Insert"];
export type TablesUpdate<T extends keyof PublicTables> = PublicTables[T]["Update"];

export type Cycle = Tables<"cycles">;
export type Goal = Tables<"goals">;
export type Task = Tables<"tasks">;
export type TaskInstance = Tables<"task_instances">;
export type WeeklyReview = Tables<"week_reviews">;
export type Profile = Tables<"profiles">;
