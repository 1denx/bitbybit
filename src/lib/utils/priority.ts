import type { TaskPriority } from "@/src/types";

export interface PriorityConfig {
  label: string;
  shortLabel: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  dotColor: string;
}

export const PRIORITY_CONFIG: Record<TaskPriority, PriorityConfig> = {
  urgent_important: {
    label: "緊急且重要",
    shortLabel: "高優先級",
    borderColor: "border-l-rose-400",
    bgColor: "bg-rose-50",
    textColor: "text-rose-500",
    dotColor: "bg-rose-400",
  },
  important: {
    label: "重要但不緊急",
    shortLabel: "中優先級",
    borderColor: "border-l-amber-400",
    bgColor: "bg-amber-50",
    textColor: "text-amber-500",
    dotColor: "bg-amber-400",
  },
  urgent: {
    label: "緊急但不重要",
    shortLabel: "低優先級",
    borderColor: "border-l-sky-400",
    bgColor: "bg-sky-50",
    textColor: "text-sky-500",
    dotColor: "bg-sky-400",
  },
  normal: {
    label: "不緊急且不重要",
    shortLabel: "無優先級",
    borderColor: "border-l-zinc-300",
    bgColor: "bg-zinc-50",
    textColor: "text-zinc-400",
    dotColor: "bg-zinc-300",
  },
};

export const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "urgent_important", label: "緊急且重要" },
  { value: "important", label: "重要但不緊急" },
  { value: "urgent", label: "緊急但不重要" },
  { value: "normal", label: "不緊急且不重要" },
];

export const FREQUENCY_OPTIONS: { value: string; label: string }[] = [
  { value: "daily", label: "每天" },
  { value: "1", label: "1 次/週" },
  { value: "2", label: "2 次/週" },
  { value: "3", label: "3 次/週" },
  { value: "4", label: "4 次/週" },
  { value: "5", label: "5 次/週" },
  { value: "6", label: "6 次/週" },
];
