"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import type { TaskInstance } from "@/src/types";

interface ExpiredTasksBarProps {
  expiredInstances: TaskInstance[];
}

export function ExpiredTasksBar({ expiredInstances }: ExpiredTasksBarProps) {
  const router = useRouter();

  if (expiredInstances.length === 0) return null;

  return (
    <div className="mx-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <AlertTriangle size={11} className="text-amber-700" />
        <span className="text-xs font-semibold text-amber-700">
          過期任務 ({expiredInstances.length})
        </span>
      </div>
      <p className="text-[10px] text-amber-600 mb-2">有任務未完成，請前往看板處理</p>
      <button
        type="button"
        onClick={() => router.push("/task/board")}
        className="text-[10px] bg-amber-600 text-white rounded px-2.5 py-1 hover:bg-amber-700 transition-colors"
      >
        前往看板
      </button>
    </div>
  );
}
