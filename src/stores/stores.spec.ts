import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { installMock, db } from '@/mock';
import { ApiError } from '@/api';
import { ApiErrorCode, TaskStatus } from '@/types';
import {
  DEFAULT_PROJECT_COLUMN_WIDTHS,
  DEFAULT_TASK_COLUMN_WIDTHS,
  DEFAULT_UI_PREFERENCES,
  STORAGE_KEYS,
  UI_PREFS_LAYOUT_VERSION,
} from '@/constants';
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

  it('migrates old persisted column widths to the new defaults once, preserving other prefs', () => {
    // Existing user: old wide widths + theme/locale/viewMode set, no layoutVersion.
    localStorage.setItem(
      STORAGE_KEYS.uiPrefs,
      JSON.stringify({
        viewMode: 'kanban',
        theme: 'dark',
        locale: 'uk',
        projectColumnWidths: { id: 80, name: 280, tasksCount: 130, status: 140, createdAt: 170 },
        taskColumnWidths: { id: 80, title: 340, assignee: 160, status: 150, dueDate: 160 },
      }),
    );
    setActivePinia(createPinia());
    const ui = useUiPrefsStore();

    // Column widths reset to the new compact defaults...
    expect(ui.projectColumnWidths).toEqual(DEFAULT_PROJECT_COLUMN_WIDTHS);
    expect(ui.taskColumnWidths).toEqual(DEFAULT_TASK_COLUMN_WIDTHS);
    // ...but theme, locale and view mode are preserved.
    expect(ui.theme).toBe('dark');
    expect(ui.locale).toBe('uk');
    expect(ui.viewMode).toBe('kanban');
    // The migration is persisted so it won't re-run on the next load.
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.uiPrefs) ?? '{}');
    expect(stored.layoutVersion).toBe(UI_PREFS_LAYOUT_VERSION);
    expect(stored.theme).toBe('dark');
  });

  it('keeps customized column widths once the layout version is current', () => {
    const custom = { id: 100, name: 300, tasksCount: 120, status: 132, createdAt: 160 };
    localStorage.setItem(
      STORAGE_KEYS.uiPrefs,
      JSON.stringify({
        ...DEFAULT_UI_PREFERENCES,
        layoutVersion: UI_PREFS_LAYOUT_VERSION,
        projectColumnWidths: custom,
      }),
    );
    setActivePinia(createPinia());
    const ui = useUiPrefsStore();
    expect(ui.projectColumnWidths).toEqual(custom);
  });
});
