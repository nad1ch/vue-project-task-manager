import {
  ProjectStatus,
  TaskStatus,
  ViewMode,
  type ColumnWidths,
  type ProjectColumnKey,
  type TaskColumnKey,
  type Tone,
  type UiPreferences,
} from '@/types';

export const STORAGE_KEYS = {
  projects: 'tms.db.projects',
  tasks: 'tms.db.tasks',
  meta: 'tms.db.meta',
  uiPrefs: 'tms.ui.prefs',
} as const;

export const SCHEMA_VERSION = 1;
export const DEBOUNCE_MS = 250;
export const MOCK_LATENCY_MIN_MS = 150;
export const MOCK_LATENCY_MAX_MS = 300;

/** Predefined assignee list (task assignee is optional, chosen from this list). */
export const ASSIGNEES = ['Bohdan', 'Olena', 'Ihor', 'Maria', 'Andrii'] as const;
export type Assignee = (typeof ASSIGNEES)[number];

export const PROJECT_STATUS_META: Record<ProjectStatus, { label: string; tone: Tone }> = {
  [ProjectStatus.Active]: { label: 'Active', tone: 'success' },
  [ProjectStatus.Archived]: { label: 'Archived', tone: 'neutral' },
};

export const TASK_STATUS_META: Record<TaskStatus, { label: string; tone: Tone }> = {
  [TaskStatus.Todo]: { label: 'To Do', tone: 'neutral' },
  [TaskStatus.InProgress]: { label: 'In Progress', tone: 'info' },
  [TaskStatus.Done]: { label: 'Done', tone: 'success' },
};

export const DEFAULT_PROJECT_COLUMN_WIDTHS: Required<ColumnWidths<ProjectColumnKey>> = {
  id: 80,
  name: 280,
  tasksCount: 130,
  status: 140,
  createdAt: 170,
};

export const DEFAULT_TASK_COLUMN_WIDTHS: Required<ColumnWidths<TaskColumnKey>> = {
  id: 80,
  title: 340,
  assignee: 160,
  status: 150,
  dueDate: 160,
};

export const DEFAULT_UI_PREFERENCES: UiPreferences = {
  viewMode: ViewMode.Table,
  theme: 'light',
  projectSort: null,
  taskSort: null,
  projectFilters: { search: '', status: 'all' },
  taskFilters: { assignee: 'all', status: 'all' },
  projectColumnWidths: { ...DEFAULT_PROJECT_COLUMN_WIDTHS },
  taskColumnWidths: { ...DEFAULT_TASK_COLUMN_WIDTHS },
};
