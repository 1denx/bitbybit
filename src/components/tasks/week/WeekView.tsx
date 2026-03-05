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
import { format } from "date-fns";
import { WeekTaskList } from "./WeekTaskList";
import { WeekCalendar } from "./WeekCalendar";
import { TaskOffcanvas } from "../TaskOffcanvas";
import { useTaskInstances } from "@/src/hooks/useTaskInstance";
import { useTaskStore } from "@/src/store/taskStore";
import { useUIStore } from "@/src/store/uiStore";
import { getDefaultEndTime, pixelsToTime } from "@/src/lib/utils/calendar";
import type { Task, TaskInstance } from "@/src/types";

interface WeekViewProps {
  weekDays: Date[];
  cycleId: string;
  weekNumber: number;
}

export function WeekView({ weekDays, cycleId, weekNumber }: WeekViewProps) {
  const { tasks, taskInstances } = useTaskStore();
  const { createInstance, rescheduleInstance, completeInstance, uncompleteInstance } =
    useTaskInstances();
  const { offcanvasOpen, selectInstanceId, openOffcanvas, closeOffcanvas } = useUIStore();

  const [activeDragTaskId, setActiveDragTaskId] = useState<string | null>(null);

  // 建立 taskId (週曆渲染用)
  const taskMap: Record<string, Task> = {};
  tasks.forEach(task => {
    taskMap[task.id] = task;
  });

  const selectedInstance = taskInstances.find(instance => instance.id === selectInstanceId) ?? null;

  const selectedTask = selectedInstance ? taskMap[selectedInstance.task_id] : null;

  // 同一 task 本週所有 instances
  const weekInstancesForSelected = selectedTask
    ? taskInstances.filter(instance => instance.task_id === selectedTask.id)
    : [];

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // 滑鼠移動 5px 才開始 drag，避免誤觸
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { taskId } = event.active.data.current as { taskId: string };
    setActiveDragTaskId(taskId);
  };

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveDragTaskId(null);

      const { over, active, delta } = event;
      if (!over) return;

      const dragData = active.data.current as {
        type: string;
        taskId: string;
        goalId: string;
        instanceId: string | null;
      };

      const dropData = over.data.current as { dateStr: string };
      if (!dropData?.dateStr) return;

      // 計算落點時間
      const startTime = "09:00";
      const endTime = getDefaultEndTime(startTime);

      if (dragData.instanceId) {
        // 已有 instance 重新排程
        await rescheduleInstance({
          instanceId: dragData.instanceId,
          scheduledDate: dropData.dateStr,
          scheduledStartTime: startTime,
          scheduledEndTime: endTime,
        });
      } else {
        // 新 instance
        const task = taskMap[dragData.taskId];
        if (!task) return;

        await createInstance(
          dragData.taskId,
          dragData.goalId,
          cycleId,
          weekNumber,
          dropData.dateStr,
          startTime,
          endTime,
        );
      }
    },
    [taskMap, cycleId, weekNumber],
  );

  const handleToggleComplete = async (instanceId: string) => {
    const instance = taskInstances.find(inst => inst.id === instanceId);
    if (!instance) return;

    if (instance.status === "completed") {
      await uncompleteInstance(instanceId);
    } else {
      await completeInstance(instanceId);
    }
  };

  const handleEventClick = (instance: TaskInstance) => {
    openOffcanvas(instance.id);
  };

  const activeDragTask = activeDragTaskId ? taskMap[activeDragTaskId] : null;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-full overflow-hidden">
        {/* 左側任務列表 */}
        <div className="w-52 shrink-0 border-r border-zinc-100">
          <WeekTaskList
            tasks={tasks}
            taskInstances={taskInstances}
            weekNumber={weekNumber}
            onToggleComplete={handleToggleComplete}
          />
        </div>

        {/* 右側週曆 */}
        <WeekCalendar
          weekDays={weekDays}
          taskInstances={taskInstances}
          taskMap={taskMap}
          onEventClick={handleEventClick}
        />
      </div>

      {/* Drag Overlay：拖曳中顯示的浮動預覽 */}
      <DragOverlay>
        {activeDragTask && (
          <div
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-xl text-xs font-medium text-zinc-700 opacity-90 rotate-1"
            style={{ width: 180 }}
          >
            {activeDragTask.title}
          </div>
        )}
      </DragOverlay>

      {/* Offcanvas */}
      <TaskOffcanvas
        open={offcanvasOpen}
        onClose={closeOffcanvas}
        instance={selectedInstance}
        task={selectedTask}
        weekInstances={weekInstancesForSelected}
        onComplete={completeInstance}
        onUncomplete={uncompleteInstance}
      />
    </DndContext>
  );
}
