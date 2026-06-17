import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { installMock, db } from '@/mock';
import { projectService } from './projectService';
import { taskService } from './taskService';
import { ApiErrorCode } from '@/types';

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

beforeAll(() => {
  installMock();
});

beforeEach(() => {
  localStorage.clear();
  db.init();
});

describe('projectService', () => {
  it('lists seeded projects', async () => {
    const projects = await projectService.list();
    expect(projects.length).toBeGreaterThan(0);
  });

  it('rejects an invalid create before hitting the wire', async () => {
    await expect(projectService.create({ name: 'A', status: 'active' })).rejects.toMatchObject({
      code: ApiErrorCode.Validation,
      status: 422,
    });
  });

  it('creates a valid project', async () => {
    const created = await projectService.create({ name: 'Valid Name', status: 'active' });
    expect(created.id).toBeTypeOf('number');
  });

  it('maps an unknown id to a NOT_FOUND ApiError', async () => {
    await expect(projectService.update(9999, { name: 'Renamed' })).rejects.toMatchObject({
      code: ApiErrorCode.NotFound,
    });
  });
});

describe('taskService', () => {
  it('rejects a past due date on create', async () => {
    await expect(
      taskService.create({
        projectId: 1,
        title: 'Valid title',
        status: 'todo',
        dueDate: daysFromNow(-1),
        assignee: null,
      }),
    ).rejects.toMatchObject({ code: ApiErrorCode.Validation });
  });

  it('creates a valid task', async () => {
    const created = await taskService.create({
      projectId: 1,
      title: 'A valid task',
      status: 'todo',
      dueDate: daysFromNow(2),
      assignee: 'Bohdan',
    });
    expect(created.projectId).toBe(1);
  });

  it('lists tasks scoped by project', async () => {
    const tasks = await taskService.list(1);
    expect(tasks.every((t) => t.projectId === 1)).toBe(true);
  });
});
