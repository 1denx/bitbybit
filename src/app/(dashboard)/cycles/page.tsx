"use client";

import { useEffect, useState } from "react";
import { Plus, RefreshCcw } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { CycleCard } from "@/src/components/cycles/CycleCard";
import { CycleModal } from "@/src/components/modals/CycleModal";
import { useCycles } from "@/src/hooks/useCycles";
import type { Cycle } from "@/src/types";

export default function CyclesPage() {
  const { cycles, isLoading, fetchCycles } = useCycles();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Cycle | null>(null);

  const goalCountMap: Record<string, number> = {};

  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);

  const handleEdit = (cycle: Cycle) => {
    setEditTarget(cycle);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditTarget(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* TopBar */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">週期管理</h1>
        </div>
        <Button onClick={() => setModalOpen(true)} className="flex items-center">
          <Plus size={14} className="sm:mr-1" />
          <span className="hidden sm:block">新增週期</span>
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* 載入中 */}
        {isLoading && (
          <div className="flex items-center justify-center py-20 text-zinc-400">
            <RefreshCcw size={16} className="animate-spin mr-2" />
            載入中...
          </div>
        )}

        {/* 空狀態 */}
        {!isLoading && cycles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h3 className="font-semibold text-zinc-700 mb-1">還沒有任何週期</h3>
            <p className="text-sm text-zinc-400 mb-6">建立一個 12 週計畫，開始執行目標</p>
            <Button onClick={() => setModalOpen(true)}>
              <Plus size={14} className="mr-1" />
              建立週期
            </Button>
          </div>
        )}

        {/* 週期列表 */}
        {!isLoading && cycles.length > 0 && (
          <div className="flex flex-col gap-3 max-w-2xl">
            {cycles.map(cycle => (
              <CycleCard
                key={cycle.id}
                cycle={cycle}
                goalCount={goalCountMap[cycle.id] ?? 0}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}

        {/* Modal */}
        <CycleModal open={modalOpen} onClose={handleCloseModal} editTarget={editTarget} />
      </div>
    </div>
  );
}
