import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { installMock, db } from '@/mock';
import { ApiError } from '@/api';
import { ApiErrorCode, TaskStatus } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { useProjectsStore } from './useProjectsStore';
import { useTasksStore } from './useTasksStore';
import { useUiPrefsStore } from './useUiPrefsStore';
import { projectService } from '@/services/projectService';

beforeAll(() => {
  installMock();
});

beforeEach(() => {
  localStorage.clear();
  db.init();
  setActivePinia(createPinia());
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useProjectsStore', () => {
  it('loads, creates and removes projects (cascading tasks)', async () => {
    const projects = useProjectsStore();
    const tasks = useTasksStore();
    await projects.load();
    await tasks.loadAll();
    expect(projects.items.length).toBeGreaterThan(0);

    const created = await projects.create({ name: 'Fresh Project', status: 'active' });
    expect(created).not.toBeNull();

    const removed = await projects.remove(1);
    expect(removed).toBe(true);
    expect(projects.projectById(1)).toBeUndefined();
    expect(tasks.items.some((t) => t.projectId === 1)).toBe(false);
  });

  it('rolls back an optimistic update when the service fails', async () => {
    const projects = useProjectsStore();
    await projects.load();
    const original = projects.projectById(1);
    expect(original).toBeDefined();
    const originalName = original?.name;

    vi.spyOn(projectService, 'update').mockRejectedValueOnce(
      new ApiError({ code: ApiErrorCode.Unknown, status: 500, message: 'boom' }),
    );

    const result = await projects.update(1, { name: 'Should Roll Back' });
    expect(result).toBeNull();
    expect(projects.projectById(1)?.name).toBe(originalName);
  });
});

describe('useTasksStore', () => {
  it('derives a per-project task count', async () => {
    const tasks = useTasksStore();
    await tasks.loadAll();
    expect(tasks.countByProjectId[1]).toBeGreaterThan(0);
  });

  it('moves a task across lanes updating status and order', async () => {
    const tasks = useTasksStore();
    await tasks.loadAll();
    const todoBefore = tasks.laneOf(1, TaskStatus.Todo);
    const moved = todoBefore[0];
    expect(moved).toBeDefined();
    const movedId = moved?.id ?? -1;

    await tasks.moveTask(movedId, TaskStatus.Done, 0);

    const done = tasks.laneOf(1, TaskStatus.Done);
    expect(done[0]?.id).toBe(movedId);
    expect(done[0]?.status).toBe(TaskStatus.Done);
    // orders are contiguous in the destination lane
    expect(done.map((t) => t.order)).toEqual(done.map((_, i) => i));
  });

  it('reorders within a lane', async () => {
    const tasks = useTasksStore();
    await tasks.loadAll();
    const lane = tasks.laneOf(1, TaskStatus.Todo);
    if (lane.length < 2) return;
    const firstId = lane[0]?.id;
    await tasks.reorderWithinLane(1, TaskStatus.Todo, 0, 1);
    const after = tasks.laneOf(1, TaskStatus.Todo);
    expect(after[1]?.id).toBe(firstId);
    expect(after.map((t) => t.order)).toEqual(after.map((_, i) => i));
  });
});

describe('useUiPrefsStore', () => {
  it('persists the view mode to localStorage', () => {
    const ui = useUiPrefsStore();
    ui.setViewMode('kanban');
    const raw = localStorage.getItem(STORAGE_KEYS.uiPrefs) ?? '{}';
    expect(JSON.parse(raw)).toMatchObject({ viewMode: 'kanban' });
  });

  it('cycles task sort asc -> desc -> null', () => {
    const ui = useUiPrefsStore();
    ui.toggleTaskSort('title');
    expect(ui.taskSort).toEqual({ key: 'title', direction: 'asc' });
    ui.toggleTaskSort('title');
    expect(ui.taskSort).toEqual({ key: 'title', direction: 'desc' });
    ui.toggleTaskSort('title');
    expect(ui.taskSort).toBeNull();
  });

  it('falls back to defaults on corrupt preferences', () => {
    localStorage.setItem(STORAGE_KEYS.uiPrefs, '{broken');
    setActivePinia(createPinia());
    const ui = useUiPrefsStore();
    expect(ui.viewMode).toBe('table');
  });
});
