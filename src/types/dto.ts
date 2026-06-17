import type { ProjectStatus, TaskStatus } from './enums';

export interface CreateProjectDto {
  name: string;
  description?: string;
  status: ProjectStatus;
}
export type UpdateProjectDto = Partial<CreateProjectDto>;

export interface CreateTaskDto {
  projectId: number;
  title: string;
  status: TaskStatus;
  dueDate: string;
  assignee: string | null;
}
/** projectId is immutable after creation, so it is omitted from updates. `order` is internal. */
export type UpdateTaskDto = Partial<Omit<CreateTaskDto, 'projectId'>> & { order?: number };
