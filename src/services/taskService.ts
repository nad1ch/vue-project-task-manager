import { api, ENDPOINTS } from '@/api';
import type { CreateTaskDto, Task, UpdateTaskDto } from '@/types';
import { taskCreateSchema, taskUpdateSchema } from '@/lib/validation/taskSchema';
import { zodToApiError } from './toApiError';

export const taskService = {
  /** projectId omitted => all tasks (mock convenience for dashboard / project task counts). */
  list(projectId?: number): Promise<Task[]> {
    const config = projectId === undefined ? undefined : { params: { projectId } };
    return api.get<Task[]>(ENDPOINTS.tasks, config);
  },

  create(dto: CreateTaskDto): Promise<Task> {
    const parsed = taskCreateSchema.safeParse({
      title: dto.title,
      status: dto.status,
      assignee: dto.assignee,
      dueDate: dto.dueDate,
    });
    if (!parsed.success) return Promise.reject(zodToApiError(parsed.error));
    return api.post<Task, CreateTaskDto>(ENDPOINTS.tasks, dto);
  },

  update(id: number, dto: UpdateTaskDto): Promise<Task> {
    const parsed = taskUpdateSchema.safeParse(dto);
    if (!parsed.success) return Promise.reject(zodToApiError(parsed.error));
    return api.put<Task, UpdateTaskDto>(ENDPOINTS.task(id), dto);
  },

  remove(id: number): Promise<void> {
    return api.delete<void>(ENDPOINTS.task(id));
  },
} as const;
