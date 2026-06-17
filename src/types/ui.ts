import type { ProjectStatus, TaskStatus } from './enums';

export const ViewMode = {
  Table: 'table',
  Kanban: 'kanban',
} as const;
export type ViewMode = (typeof ViewMode)[keyof typeof ViewMode];

export const SortDirection = {
  Asc: 'asc',
  Desc: 'desc',
} as const;
export type SortDirection = (typeof SortDirection)[keyof typeof SortDirection];

export type ThemeMode = 'light' | 'dark';

export type Tone = 'neutral' | 'success' | 'info' | 'warning' | 'danger';

export type ProjectColumnKey = 'id' | 'name' | 'tasksCount' | 'status' | 'createdAt';
export type TaskColumnKey = 'id' | 'title' | 'assignee' | 'status' | 'dueDate';

export interface SortDescriptor<K extends string> {
  key: K;
  direction: SortDirection;
}

export interface ProjectFilters {
  search: string;
  status: ProjectStatus | 'all';
}

export interface TaskFilters {
  assignee: string | 'all';
  status: TaskStatus | 'all';
}

export type ColumnWidths<K extends string> = Partial<Record<K, number>>;

export interface UiPreferences {
  viewMode: ViewMode;
  theme: ThemeMode;
  projectSort: SortDescriptor<ProjectColumnKey> | null;
  taskSort: SortDescriptor<TaskColumnKey> | null;
  projectFilters: ProjectFilters;
  taskFilters: TaskFilters;
  projectColumnWidths: ColumnWidths<ProjectColumnKey>;
  taskColumnWidths: ColumnWidths<TaskColumnKey>;
}

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  variant: ToastVariant;
  message: string;
  timeout: number;
}
