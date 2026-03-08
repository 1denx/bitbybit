import { create } from "zustand";
import type { Goal } from "../types";

interface GoalStore {
  goals: Goal[];
  isLoading: boolean;

  setGoals: (goals: Goal[]) => void;
  setIsLoading: (loading: boolean) => void;

  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
}

export const useGoalStore = create<GoalStore>(set => ({
  goals: [],
  isLoading: false,

  setGoals: goals => set({ goals }),
  setIsLoading: isLoading => set({ isLoading }),

  addGoal: goal => set(state => ({ goals: [...state.goals, goal] })),

  updateGoal: (id, updates) =>
    set(state => ({
      goals: state.goals.map(goal => (goal.id === id ? { ...goal, ...updates } : goal)),
    })),

  removeGoal: id => set(state => ({ goals: state.goals.filter(goal => goal.id !== id) })),
}));
