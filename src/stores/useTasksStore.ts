import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { ApiError, normalizeError } from '@/api';
import { taskService } from '@/services/taskService';
import { moveItem, sequentialOrderChanges, type OrderChange } from '@/lib/reorder';
import {
  TaskStatus,
  type CreateTaskDto,
  type Task,
  type TaskStatus as TaskStatusType,
  type UpdateTaskDto,
} from '@/types';
import { useToastStore } from './useToastStore';

type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

function byOrder(a: Task, b: Task): number {
  return a.order - b.order;
}

export const useTasksStore = defineStore('tasks', () => {
  const items = ref<Task[]>([]);
  const status = ref<LoadStatus>('idle');
  const error = ref<ApiError | null>(null);
  const pendingIds = ref<Set<number>>(new Set());
  const loaded = ref(false);

  const isLoading = computed(() => status.value === 'loading');
  const hasError = computed(() => error.value !== null);

  const tasksForProject = (projectId: number): Task[] =>
    items.value.filter((t) => t.projectId === projectId);

  const countByProjectId = computed<Record<number, number>>(() => {
    const counts: Record<number, number> = {};
    for (const t of items.value) counts[t.projectId] = (counts[t.projectId] ?? 0) + 1;
    return counts;
  });

  const countByStatus = computed<Record<TaskStatusType, number>>(() => {
    const counts: Record<TaskStatusType, number> = {
      [TaskStatus.Todo]: 0,
      [TaskStatus.InProgress]: 0,
      [TaskStatus.Done]: 0,
    };
    for (const t of items.value) counts[t.status] += 1;
    return counts;
  });

  function laneOf(projectId: number, lane: TaskStatusType): Task[] {
    return items.value.filter((t) => t.projectId === projectId && t.status === lane).sort(byOrder);
  }

  function lanesForProject(projectId: number): Record<TaskStatusType, Task[]> {
    return {
      [TaskStatus.Todo]: laneOf(projectId, TaskStatus.Todo),
      [TaskStatus.InProgress]: laneOf(projectId, TaskStatus.InProgress),
      [TaskStatus.Done]: laneOf(projectId, TaskStatus.Done),
    };
  }

  function setPending(id: number, pending: boolean): void {
    const next = new Set(pendingIds.value);
    if (pending) next.add(id);
    else next.delete(id);
    pendingIds.value = next;
  }

  async function loadAll(force = false): Promise<void> {
    if (loaded.value && !force) return;
    status.value = 'loading';
    error.value = null;
    try {
      items.value = await taskService.list();
      status.value = 'success';
      loaded.value = true;
    } catch (e) {
      const err = normalizeError(e);
      error.value = err;
      status.value = 'error';
      useToastStore().error(err.message);
    }
  }

  async function create(dto: CreateTaskDto): Promise<Task | null> {
    try {
      const created = await taskService.create(dto);
      items.value = [...items.value, created];
      useToastStore().success('Task created');
      return created;
    } catch (e) {
      useToastStore().error(normalizeError(e).message);
      return null;
    }
  }

  async function update(id: number, dto: UpdateTaskDto): Promise<Task | null> {
    const snapshot = items.value.find((t) => t.id === id);
    if (snapshot) items.value = items.value.map((t) => (t.id === id ? { ...t, ...dto } : t));
    setPending(id, true);
    try {
      const updated = await taskService.update(id, dto);
      items.value = items.value.map((t) => (t.id === id ? updated : t));
      useToastStore().success('Task updated');
      return updated;
    } catch (e) {
      if (snapshot) items.value = items.value.map((t) => (t.id === id ? snapshot : t));
      useToastStore().error(normalizeError(e).message);
      return null;
    } finally {
      setPending(id, false);
    }
  }

  async function remove(id: number): Promise<boolean> {
    const snapshot = [...items.value];
    items.value = items.value.filter((t) => t.id !== id);
    try {
      await taskService.remove(id);
      useToastStore().success('Task deleted');
      return true;
    } catch (e) {
      items.value = snapshot;
      useToastStore().error(normalizeError(e).message);
      return false;
    }
  }

  function applyOrderChanges(changes: OrderChange[]): void {
    if (changes.length === 0) return;
    const map = new Map(changes.map((c) => [c.id, c.order]));
    items.value = items.value.map((t) => {
      const order = map.get(t.id);
      return order === undefined ? t : { ...t, order };
    });
  }

  async function persistChanges(changes: ReadonlyArray<{ id: number; dto: UpdateTaskDto }>): Promise<void> {
    if (changes.length === 0) return;
    const snapshot = [...items.value];
    try {
      await Promise.all(changes.map((c) => taskService.update(c.id, c.dto)));
    } catch (e) {
      items.value = snapshot;
      useToastStore().error(normalizeError(e).message);
      await loadAll(true);
    }
  }

  /** Reorder within one lane (table manual order, or kanban same-column drag). */
  async function reorderWithinLane(
    projectId: number,
    lane: TaskStatusType,
    fromIndex: number,
    toIndex: number,
  ): Promise<void> {
    const current = laneOf(projectId, lane);
    const moved = moveItem(current, fromIndex, toIndex);
    const changes = sequentialOrderChanges(moved);
    if (changes.length === 0) return;
    applyOrderChanges(changes);
    await persistChanges(changes.map((c) => ({ id: c.id, dto: { order: c.order } })));
  }

  /** Move a task to another status at a target index (kanban cross-column drag). */
  async function moveTask(id: number, toStatus: TaskStatusType, toIndex: number): Promise<void> {
    const task = items.value.find((t) => t.id === id);
    if (!task) return;

    if (task.status === toStatus) {
      const fromIndex = laneOf(task.projectId, toStatus).findIndex((t) => t.id === id);
      await reorderWithinLane(task.projectId, toStatus, fromIndex, toIndex);
      return;
    }

    const source = laneOf(task.projectId, task.status).filter((t) => t.id !== id);
    const target = [...laneOf(task.projectId, toStatus)];
    const movedTask: Task = { ...task, status: toStatus };
    target.splice(Math.max(0, Math.min(toIndex, target.length)), 0, movedTask);

    const patches = new Map<number, UpdateTaskDto>();
    target.forEach((t, index) => {
      patches.set(t.id, t.id === id ? { status: toStatus, order: index } : { order: index });
    });
    source.forEach((t, index) => {
      patches.set(t.id, { order: index });
    });

    items.value = items.value.map((t) => {
      const dto = patches.get(t.id);
      return dto === undefined ? t : { ...t, ...dto };
    });
    await persistChanges(Array.from(patches, ([taskId, dto]) => ({ id: taskId, dto })));
  }

  function handleProjectRemoved(projectId: number): void {
    items.value = items.value.filter((t) => t.projectId !== projectId);
  }

  return {
    items,
    status,
    error,
    pendingIds,
    loaded,
    isLoading,
    hasError,
    tasksForProject,
    countByProjectId,
    countByStatus,
    laneOf,
    lanesForProject,
    loadAll,
    create,
    update,
    remove,
    reorderWithinLane,
    moveTask,
    handleProjectRemoved,
  };
});
