"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { MatrixQuadrant } from "./MatrixQuadrant";
import { useTasks } from "@/src/hooks/useTasks";
import { useTaskStore } from "@/src/store/taskStore";
import type { Task, TaskPriority } from "@/src/types";

const PRIORITY_ORDER: TaskPriority[] = ["urgent_important", "important", "urgent", "normal"];

interface MatrixViewProps {
  weekNumber: number;
}

export function MatrixView({ weekNumber }: MatrixViewProps) {
  const { tasks } = useTaskStore();
  const { updateTaskPriority } = useTasks();

  const [activeDragTask, setActiveDragTask] = useState<Task | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // 本週應執行的任務
  const weekTasks = tasks.filter(task => task.scheduled_weeks.includes(weekNumber));

  // 依優先級分組
  const tasksByPriority: Record<TaskPriority, Task[]> = {
    urgent_important: [],
    important: [],
    urgent: [],
    normal: [],
  };
  weekTasks.forEach(task => {
    tasksByPriority[task.priority].push(task);
  });

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as { taskId: string };
    const task = tasks.find(t => t.id === data.taskId) ?? null;
    setActiveDragTask(task);
  };

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveDragTask(null);

      const { over, active } = event;
      if (!over) return;

      const dragData = active.data.current as {
        taskId: string;
        currentPriority: TaskPriority;
      };
      const dropData = over.data.current as { priority: TaskPriority };

      // 同一象限不做任何事
      if (dragData.currentPriority === dropData.priority) return;

      // 更新 priority
      await updateTaskPriority(dragData.taskId, dropData.priority);
    },
    [updateTaskPriority],
  );

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full overflow-hidden p-4 gap-3">
        <div className="flex flex-1 gap-3 min-h-0">
          {/* 2*2 矩陣 */}
          <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-3 min-h-0">
            {PRIORITY_ORDER.map(priority => (
              <MatrixQuadrant
                key={priority}
                priority={priority}
                tasks={tasksByPriority[priority]}
              />
            ))}
          </div>
        </div>

        {/* 底部提示 */}
        <p className="text-center text-[10px] text-zinc-400 shrink-0 pb-1">
          拖曳卡片可以改變優先級，同步更新目標頁面設定
        </p>
      </div>

      {/* DragOverlay */}
      <DragOverlay>
        {activeDragTask && (
          <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 shadow-xl rotate-1 opacity-90 w-40">
            <div className="text-xs font-medium text-zinc-800 truncate">{activeDragTask.title}</div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
