import type MockAdapter from 'axios-mock-adapter';
import type { CreateProjectDto, Project, UpdateProjectDto } from '@/types';
import { nowIso } from '@/lib/date';
import { db } from '../db';
import { errorReply, idFromUrl, notFound, parseBody, withMock } from './shared';
import { ApiErrorCode } from '@/types';

export function registerProjectHandlers(mock: MockAdapter): void {
  // GET /projects
  mock.onGet('/projects').reply(() => withMock(() => [200, db.projects()]));

  // POST /projects
  mock.onPost('/projects').reply((config) =>
    withMock(() => {
      const dto = parseBody<CreateProjectDto>(config.data);
      if (!dto.name || dto.name.trim().length < 2) {
        return errorReply(422, ApiErrorCode.Validation, 'Name must be at least 2 characters');
      }
      const now = nowIso();
      const project: Project = {
        id: db.nextId(),
        name: dto.name.trim(),
        description: dto.description?.trim() || undefined,
        status: dto.status,
        createdAt: now,
        updatedAt: now,
      };
      db.saveProjects([...db.projects(), project]);
      return [201, project];
    }),
  );

  // PUT /projects/:id
  mock.onPut(/\/projects\/\d+$/).reply((config) =>
    withMock(() => {
      const id = idFromUrl(config.url);
      const dto = parseBody<UpdateProjectDto>(config.data);
      const existing = db.projects().find((p) => p.id === id);
      if (!existing) return notFound(`Project ${id} not found`);
      const updated: Project = {
        ...existing,
        ...dto,
        id: existing.id,
        updatedAt: nowIso(),
      };
      db.saveProjects(db.projects().map((p) => (p.id === id ? updated : p)));
      return [200, updated];
    }),
  );

  // DELETE /projects/:id (cascade removes the project's tasks)
  mock.onDelete(/\/projects\/\d+$/).reply((config) =>
    withMock(() => {
      const id = idFromUrl(config.url);
      if (!db.projects().some((p) => p.id === id)) return notFound(`Project ${id} not found`);
      db.saveProjects(db.projects().filter((p) => p.id !== id));
      db.saveTasks(db.tasks().filter((t) => t.projectId !== id));
      return [204];
    }),
  );
}
