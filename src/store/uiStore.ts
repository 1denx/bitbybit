import { create } from "zustand";

interface UIStore {
  // Offcanvas
  offcanvasOpen: boolean;
  selectInstanceId: string | null;
  openOffcanvas: (instanceId: string) => void;
  closeOffcanvas: () => void;

  // Modal
  cycleModalOpen: boolean;
  goalModalOpen: boolean;
  quickAddTaskModalOpen: boolean;

  setCycleModalOpen: (open: boolean) => void;
  setGoalModalOpen: (open: boolean) => void;
  setQuickAddTaskModalOpen: (open: boolean) => void;

  // 週視圖目前顯示的日期
  currentWeekStart: Date;
  setCurrentWeekStart: (date: Date) => void;

  // Profile
  profileName: string;
  setProfileName: (name: string) => void;
}

export const useUIStore = create<UIStore>(set => ({
  offcanvasOpen: false,
  selectInstanceId: null,
  openOffcanvas: instanceId => set({ offcanvasOpen: true, selectInstanceId: instanceId }),
  closeOffcanvas: () => set({ offcanvasOpen: false, selectInstanceId: null }),

  cycleModalOpen: false,
  goalModalOpen: false,
  quickAddTaskModalOpen: false,

  setCycleModalOpen: cycleModalOpen => set({ cycleModalOpen }),
  setGoalModalOpen: goalModalOpen => set({ goalModalOpen }),
  setQuickAddTaskModalOpen: quickAddTaskModalOpen => set({ quickAddTaskModalOpen }),

  currentWeekStart: new Date(),
  setCurrentWeekStart: currentWeekStart => set({ currentWeekStart }),

  profileName: "",
  setProfileName: profileName => set({ profileName }),
}));
