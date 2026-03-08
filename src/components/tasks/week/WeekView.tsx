"use client";

import { useState, useCallback, useRef } from "react";
import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
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
import { getDefaultEndTime, pixelsToTime, SLOT_HEIGHT, START_HOUR } from "@/src/lib/utils/calendar";
import type { Task, TaskInstance } from "@/src/types";

interface WeekViewProps {
  weekDays: Date[];
  cycleId: string;
  weekNumber: number;
}

function timeStrToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getBgColor(priority: string): string {
  const colorMap: Record<string, string> = {
    urgent_important: "#fff1f3",
    important: "#fffbeb",
    urgent: "#f0f9ff",
    normal: "#fafafa",
  };
  return colorMap[priority] ?? "#fafafa";
}

function getBorderColor(priority: string): string {
  const colorMap: Record<string, string> = {
    urgent_important: "#f43f5e",
    important: "#f59e0b",
    urgent: "#0ea5e9",
    normal: "#a1a1aa",
  };
  return colorMap[priority] ?? "#a1a1aa";
}

export function WeekView({ weekDays, cycleId, weekNumber }: WeekViewProps) {
  const { tasks, taskInstances } = useTaskStore();
  const { createInstance, rescheduleInstance, completeInstance, uncompleteInstance } =
    useTaskInstances();
  const { offcanvasOpen, selectInstanceId, openOffcanvas, closeOffcanvas } = useUIStore();

  const lastMouseYRef = useRef<number>(0);

  const [activeDragTaskId, setActiveDragTaskId] = useState<string | null>(null);
  const [activeDragInstance, setActiveDragInstance] = useState<{
    task: Task;
    instance: TaskInstance;
  } | null>(null);

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
    const data = event.active.data.current as { type: string; taskId: string; instanceId?: string };

    if (data.type === "instance" && data.instanceId) {
      // 從週曆拖曳
      const task = taskMap[data.taskId];
      const instance = taskInstances.find(inst => inst.id === data.instanceId);
      if (task && instance) {
        setActiveDragInstance({ task, instance });
      }
    } else {
      // 從左側任務列表拖曳
      setActiveDragTaskId(data.taskId);
    }
  };

  const handleDragMove = useCallback((event: DragEndEvent) => {
    // 持續更新滑鼠 Y 座標
    const nativeEvent = event.activatorEvent as MouseEvent;
    // activatorEvent 是起點，用 delta 推算當前位置
    lastMouseYRef.current = nativeEvent.clientY + event.delta.y;
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveDragTaskId(null);
      setActiveDragInstance(null);

      const { over, active } = event;
      if (!over) return;

      const dragData = active.data.current as {
        type: string;
        taskId: string;
        goalId: string;
        instanceId: string | null;
        originalStartTime?: string;
        originalEndTime?: string;
      };

      const dropData = over.data.current as { dateStr: string };
      if (!dropData?.dateStr) return;

      // 計算落點時間
      // 用 activatorEvent.clientY + delta.y 算出放開時的實際 Y
      const activatorY = (event.activatorEvent as MouseEvent).clientY;
      const currentMouseY = activatorY + event.delta.y;

      const droppedColumn = document.querySelector(
        `[data-column="true"][data-date="${dropData.dateStr}"]`,
      );

      let startTime = "09:00";

      if (droppedColumn) {
        const rect = droppedColumn.getBoundingClientRect();
        const relativeY = currentMouseY - rect.top;
        const slotIndex = Math.max(0, Math.floor(relativeY / SLOT_HEIGHT));
        const totalMinutes = slotIndex * 30 + START_HOUR * 60;
        const clampedMinutes = Math.min(totalMinutes, 23 * 60);
        const hours = Math.floor(clampedMinutes / 60);
        const minutes = clampedMinutes % 60;
        startTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      }

      if (dragData.type === "instance" && dragData.instanceId) {
        // 保留原本的時間長度
        const originalDuration =
          dragData.originalStartTime && dragData.originalEndTime
            ? timeStrToMinutes(dragData.originalEndTime) -
              timeStrToMinutes(dragData.originalStartTime)
            : 60;

        const endMinutes = timeStrToMinutes(startTime) + originalDuration;
        const clampedEnd = Math.min(endMinutes, 23 * 60 + 30);
        const endHours = Math.floor(clampedEnd / 60);
        const endMins = clampedEnd % 60;
        const endTime = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;

        await rescheduleInstance({
          instanceId: dragData.instanceId,
          scheduledDate: dropData.dateStr,
          scheduledStartTime: startTime,
          scheduledEndTime: endTime,
        });
      } else {
        // 左側 task 拖曳進來
        const task = taskMap[dragData.taskId];
        if (!task) return;

        const endTime = getDefaultEndTime(startTime);

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
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
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
        {activeDragInstance && (
          <div
            className="rounded-md px-2 py-1 shadow-xl text-[10px] font-semibold opacity-90 rotate-1"
            style={{
              width: 120,
              backgroundColor: getBgColor(activeDragInstance.task.priority),
              borderLeft: `3px solid ${getBorderColor(activeDragInstance.task.priority)}`,
            }}
          >
            {activeDragInstance.task.title}
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
