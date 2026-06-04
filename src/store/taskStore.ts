import { create } from "zustand";
import type { Task, TaskInstance } from "../types";
import { state } from "happy-dom/lib/PropertySymbol";

interface TaskStore {
  tasks: Task[];
  taskInstances: TaskInstance[];
  isLoading: boolean;

  setTasks: (tasks: Task[]) => void;
  setTaskInstances: (instances: TaskInstance[]) => void;
  setIsLoading: (loading: boolean) => void;

  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  updateInstance: (id: string, updates: Partial<TaskInstance>) => void;
  addInstance: (instance: TaskInstance) => void;
  removeInstance: (id: string) => void;
}

export const useTaskStore = create<TaskStore>(set => ({
  tasks: [],
  taskInstances: [],
  isLoading: false,

  setTasks: tasks => set({ tasks }),
  setTaskInstances: taskInstances => set({ taskInstances }),
  setIsLoading: isLoading => set({ isLoading }),

  addTask: task => set(state => ({ tasks: [...state.tasks, task] })),

  updateTask: (id, updates) =>
    set(state => ({
      tasks: state.tasks.map(task => (task.id === id ? { ...task, ...updates } : task)),
    })),

  removeTask: id => set(state => ({ tasks: state.tasks.filter(task => task.id !== id) })),

  updateInstance: (id, updates) =>
    set(state => ({
      taskInstances: state.taskInstances.map(instance =>
        instance.id === id ? { ...instance, ...updates } : instance,
      ),
    })),

  addInstance: instance => set(state => ({ taskInstances: [...state.taskInstances, instance] })),

  removeInstance: id =>
    set(state => ({ taskInstances: state.taskInstances.filter(inst => inst.id !== id) })),
}));
