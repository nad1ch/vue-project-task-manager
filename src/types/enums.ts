export const ProjectStatus = {
  Active: 'active',
  Archived: 'archived',
} as const;
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];
export const PROJECT_STATUSES: readonly ProjectStatus[] = [ProjectStatus.Active, ProjectStatus.Archived];

export const TaskStatus = {
  Todo: 'todo',
  InProgress: 'in_progress',
  Done: 'done',
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];
export const TASK_STATUSES: readonly TaskStatus[] = [
  TaskStatus.Todo,
  TaskStatus.InProgress,
  TaskStatus.Done,
];
