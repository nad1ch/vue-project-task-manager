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
/** Bumped when the default UI layout changes (e.g. compact table column widths). */
export const UI_PREFS_LAYOUT_VERSION = 1;
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

// Compact defaults: the table is `max(100%, sum-of-widths)` wide, so smaller
// widths mean less internal scroll at medium widths while still growing to fill
// wide desktops. Status/date widths stay generous enough for Ukrainian labels.
export const DEFAULT_PROJECT_COLUMN_WIDTHS: Required<ColumnWidths<ProjectColumnKey>> = {
  id: 64,
  name: 220,
  tasksCount: 108,
  status: 140,
  createdAt: 148,
};

export const DEFAULT_TASK_COLUMN_WIDTHS: Required<ColumnWidths<TaskColumnKey>> = {
  id: 64,
  title: 248,
  assignee: 128,
  status: 144,
  dueDate: 148,
};

export const DEFAULT_UI_PREFERENCES: UiPreferences = {
  layoutVersion: UI_PREFS_LAYOUT_VERSION,
  viewMode: ViewMode.Table,
  theme: 'light',
  locale: 'en',
  projectSort: null,
  taskSort: null,
  projectFilters: { search: '', status: 'all' },
  taskFilters: { assignee: 'all', status: 'all' },
  projectColumnWidths: { ...DEFAULT_PROJECT_COLUMN_WIDTHS },
  taskColumnWidths: { ...DEFAULT_TASK_COLUMN_WIDTHS },
};
