"use client";

import { useEffect } from "react";
import { useCycles } from "@/src/hooks/useCycles";
import { useHistoryStats } from "@/src/hooks/useHistoryStats";
import { HistoryCard } from "@/src/components/history/HistoryCard";
import { format, parseISO } from "date-fns";
import { Archive } from "lucide-react";

export default function HistoryPage() {
  const { cycles, fetchCycles } = useCycles();

  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);

  // 只顯示已完成的週期，依結束日期降序
  const completedCycles = cycles
    .filter(cycle => cycle.status === "completed")
    .sort((a, b) => (parseISO(b.end_date) > parseISO(a.end_date) ? 1 : -1));

  const { histories, isLoading } = useHistoryStats(completedCycles);

  // 進行中的週期也顯示 (尚未完成但可以查看進度)
  const activeCycle =
    cycles.find(cycle => cycle.status === "active") ??
    cycles.find(cycle => cycle.status === "planning") ??
    null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400">
        <p className="text-sm">載入中...</p>
      </div>
    );
  }

  if (completedCycles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="text-5xl mb-4">
          <Archive size={32} />
        </div>
        <h2 className="text-base font-bold text-zinc-700 mb-2">還沒有完成的週期</h2>
        <p className="text-sm text-zinc-400 max-w-xs">
          完成第一個 12 週週期，執行紀錄會保存在這裡。
        </p>
        {activeCycle && (
          <p className="text-xs text-zinc-400 mt-2">目前進行中：{activeCycle.name}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* TopBar */}
      <div className="flex items-center border-b px-6 py-4 bg-white shrink-0">
        <h1 className="text-xl font-semibold text-zinc-900">過去的週期</h1>
        <span className="text-xs text-zinc-400 ml-2">共 {completedCycles.length} 個週期</span>
      </div>

      {/* 卡片列表 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {histories.map(history => (
          <HistoryCard key={history.cycle.id} history={history} />
        ))}
      </div>
    </div>
  );
}
