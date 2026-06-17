import type { TaskStatus } from './enums';

export interface Task {
  id: number;
  projectId: number;
  title: string;
  status: TaskStatus;
  /** Manual sort position within its (projectId, status) lane. 0-based. */
  order: number;
  /** Required ISO date string. */
  dueDate: string;
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
}
