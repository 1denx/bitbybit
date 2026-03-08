import { create } from "zustand";
import type { Cycle } from "../types";

interface CycleStore {
  cycles: Cycle[];
  activeCycle: Cycle | null;
  isLoading: boolean;

  setCycles: (cycles: Cycle[]) => void;
  setActiveCycle: (cycle: Cycle | null) => void;
  setIsLoading: (loading: boolean) => void;

  addCycle: (cycle: Cycle) => void;
  updateCycle: (id: string, updates: Partial<Cycle>) => void;
  removeCycle: (id: string) => void;
}

// create() 用來建立 Zustand store
export const useCycleStore = create<CycleStore>(set => ({
  // 初始狀態
  cycles: [],
  activeCycle: null,
  isLoading: false,

  // 修改方法
  setCycles: cycles => set({ cycles }),
  setActiveCycle: activeCycle => set({ activeCycle }),
  setIsLoading: isLoading => set({ isLoading }),

  addCycle: cycle => set(state => ({ cycles: [...state.cycles, cycle] })),

  updateCycle: (id, updates) =>
    set(state => {
      const updatedCycle = state.cycles.map(cycle =>
        cycle.id === id ? { ...cycle, ...updates } : cycle,
      );

      const updatedActive =
        state.activeCycle?.id === id ? { ...state.activeCycle, ...updates } : state.activeCycle;

      return { cycles: updatedCycle, activeCycle: updatedActive };
    }),

  removeCycle: id =>
    set(state => ({
      cycle: state.cycles.filter(cycle => cycle.id !== id),
      activeCycle: state.activeCycle?.id === id ? null : state.activeCycle,
    })),
}));
