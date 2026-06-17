import { api, ENDPOINTS } from '@/api';
import type { CreateProjectDto, Project, UpdateProjectDto } from '@/types';
import { projectSchema, projectUpdateSchema } from '@/lib/validation/projectSchema';
import { zodToApiError } from './toApiError';

export const projectService = {
  list(): Promise<Project[]> {
    return api.get<Project[]>(ENDPOINTS.projects);
  },

  create(dto: CreateProjectDto): Promise<Project> {
    const parsed = projectSchema.safeParse(dto);
    if (!parsed.success) return Promise.reject(zodToApiError(parsed.error));
    return api.post<Project, CreateProjectDto>(ENDPOINTS.projects, {
      name: parsed.data.name,
      description: parsed.data.description,
      status: parsed.data.status,
    });
  },

  update(id: number, dto: UpdateProjectDto): Promise<Project> {
    const parsed = projectUpdateSchema.safeParse(dto);
    if (!parsed.success) return Promise.reject(zodToApiError(parsed.error));
    return api.put<Project, UpdateProjectDto>(ENDPOINTS.project(id), parsed.data);
  },

  remove(id: number): Promise<void> {
    return api.delete<void>(ENDPOINTS.project(id));
  },
} as const;
