export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      cycles: {
        Row: {
          created_at: string | null;
          end_date: string;
          id: string;
          name: string;
          start_date: string;
          status: string;
          updated_at: string | null;
          user_id: string;
          vision: string | null;
        };
        Insert: {
          created_at?: string | null;
          end_date: string;
          id?: string;
          name: string;
          start_date: string;
          status?: string;
          updated_at?: string | null;
          user_id: string;
          vision?: string | null;
        };
        Update: {
          created_at?: string | null;
          end_date?: string;
          id?: string;
          name?: string;
          start_date?: string;
          status?: string;
          updated_at?: string | null;
          user_id?: string;
          vision?: string | null;
        };
        Relationships: [];
      };
      goals: {
        Row: {
          created_at: string | null;
          cycle_id: string;
          id: string;
          priority: string;
          title: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          cycle_id: string;
          id?: string;
          priority?: string;
          title: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          cycle_id?: string;
          id?: string;
          priority?: string;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "goals_cycle_id_fkey";
            columns: ["cycle_id"];
            isOneToOne: false;
            referencedRelation: "cycles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          display_name: string | null;
          id: string;
          updated_at: string | null;
        };
        Insert: {
          display_name?: string | null;
          id: string;
          updated_at?: string | null;
        };
        Update: {
          display_name?: string | null;
          id?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      task_instances: {
        Row: {
          completed_at: string | null;
          created_at: string | null;
          cycle_id: string;
          goal_id: string;
          id: string;
          scheduled_date: string | null;
          scheduled_end_time: string | null;
          scheduled_start_time: string | null;
          status: string;
          task_id: string;
          updated_at: string | null;
          user_id: string;
          week_number: number;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string | null;
          cycle_id: string;
          goal_id: string;
          id?: string;
          scheduled_date?: string | null;
          scheduled_end_time?: string | null;
          scheduled_start_time?: string | null;
          status?: string;
          task_id: string;
          updated_at?: string | null;
          user_id: string;
          week_number: number;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string | null;
          cycle_id?: string;
          goal_id?: string;
          id?: string;
          scheduled_date?: string | null;
          scheduled_end_time?: string | null;
          scheduled_start_time?: string | null;
          status?: string;
          task_id?: string;
          updated_at?: string | null;
          user_id?: string;
          week_number?: number;
        };
        Relationships: [
          {
            foreignKeyName: "task_instances_cycle_id_fkey";
            columns: ["cycle_id"];
            isOneToOne: false;
            referencedRelation: "cycles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "task_instances_goal_id_fkey";
            columns: ["goal_id"];
            isOneToOne: false;
            referencedRelation: "goals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "task_instances_task_id_fkey";
            columns: ["task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
        ];
      };
      tasks: {
        Row: {
          category: string;
          created_at: string | null;
          cycle_id: string;
          frequency: string;
          goal_id: string;
          id: string;
          note: string | null;
          priority: string;
          scheduled_weeks: number[];
          title: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          category: string;
          created_at?: string | null;
          cycle_id: string;
          frequency?: string;
          goal_id: string;
          id?: string;
          note?: string | null;
          priority: string;
          scheduled_weeks?: number[];
          title: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          category?: string;
          created_at?: string | null;
          cycle_id?: string;
          frequency?: string;
          goal_id?: string;
          id?: string;
          note?: string | null;
          priority?: string;
          scheduled_weeks?: number[];
          title?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_cycle_id_fkey";
            columns: ["cycle_id"];
            isOneToOne: false;
            referencedRelation: "cycles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_goal_id_fkey";
            columns: ["goal_id"];
            isOneToOne: false;
            referencedRelation: "goals";
            referencedColumns: ["id"];
          },
        ];
      };
      week_reviews: {
        Row: {
          content: string;
          created_at: string | null;
          cycle_id: string;
          execution: string | null;
          id: string;
          learning: string | null;
          mood: number | null;
          reflection: string | null;
          updated_at: string | null;
          user_id: string;
          week_number: number;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          cycle_id: string;
          execution?: string | null;
          id?: string;
          learning?: string | null;
          mood?: number | null;
          reflection?: string | null;
          updated_at?: string | null;
          user_id: string;
          week_number: number;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          cycle_id?: string;
          execution?: string | null;
          id?: string;
          learning?: string | null;
          mood?: number | null;
          reflection?: string | null;
          updated_at?: string | null;
          user_id?: string;
          week_number?: number;
        };
        Relationships: [
          {
            foreignKeyName: "week_reviews_cycle_id_fkey";
            columns: ["cycle_id"];
            isOneToOne: false;
            referencedRelation: "cycles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
