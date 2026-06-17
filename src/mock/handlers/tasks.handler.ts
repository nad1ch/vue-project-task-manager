import type MockAdapter from 'axios-mock-adapter';
import { ApiErrorCode, type CreateTaskDto, type Task, type UpdateTaskDto } from '@/types';
import { nowIso } from '@/lib/date';
import { db } from '../db';
import { errorReply, idFromUrl, notFound, parseBody, withMock } from './shared';

export function registerTaskHandlers(mock: MockAdapter): void {
  // GET /tasks?projectId=  (projectId omitted => all tasks; mock convenience for dashboard/counts)
  mock.onGet('/tasks').reply((config) =>
    withMock(() => {
      const projectId = config.params?.projectId as number | undefined;
      const all = db.tasks();
      const rows =
        projectId === undefined || projectId === null
          ? all
          : all.filter((t) => t.projectId === Number(projectId));
      return [200, rows];
    }),
  );

  // POST /tasks
  mock.onPost('/tasks').reply((config) =>
    withMock(() => {
      const dto = parseBody<CreateTaskDto>(config.data);
      if (!dto.title || dto.title.trim().length < 3) {
        return errorReply(422, ApiErrorCode.Validation, 'Title must be at least 3 characters');
      }
      const tasks = db.tasks();
      const laneCount = tasks.filter(
        (t) => t.projectId === dto.projectId && t.status === dto.status,
      ).length;
      const now = nowIso();
      const task: Task = {
        id: db.nextId(),
        projectId: dto.projectId,
        title: dto.title.trim(),
        status: dto.status,
        order: laneCount,
        dueDate: dto.dueDate,
        assignee: dto.assignee,
        createdAt: now,
        updatedAt: now,
      };
      db.saveTasks([...tasks, task]);
      return [201, task];
    }),
  );

  // PUT /tasks/:id  (also handles status + order changes from DnD)
  mock.onPut(/\/tasks\/\d+$/).reply((config) =>
    withMock(() => {
      const id = idFromUrl(config.url);
      const dto = parseBody<UpdateTaskDto>(config.data);
      const existing = db.tasks().find((t) => t.id === id);
      if (!existing) return notFound(`Task ${id} not found`);
      const updated: Task = {
        ...existing,
        ...dto,
        id: existing.id,
        projectId: existing.projectId,
        updatedAt: nowIso(),
      };
      db.saveTasks(db.tasks().map((t) => (t.id === id ? updated : t)));
      return [200, updated];
    }),
  );

  // DELETE /tasks/:id
  mock.onDelete(/\/tasks\/\d+$/).reply((config) =>
    withMock(() => {
      const id = idFromUrl(config.url);
      if (!db.tasks().some((t) => t.id === id)) return notFound(`Task ${id} not found`);
      db.saveTasks(db.tasks().filter((t) => t.id !== id));
      return [204];
    }),
  );
}
