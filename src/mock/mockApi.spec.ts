import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { api } from '@/api';
import { installMock, db } from '@/mock';
import { ApiErrorCode, type CreateProjectDto, type CreateTaskDto, type Project, type Task } from '@/types';

beforeAll(() => {
  installMock();
});

beforeEach(() => {
  localStorage.clear();
  db.init();
});

describe('mock projects API', () => {
  it('GET /projects returns the seeded list', async () => {
    const projects = await api.get<Project[]>('/projects');
    expect(projects.length).toBeGreaterThan(0);
  });

  it('POST /projects continues the project id sequence (#4 after seeded #1-#3)', async () => {
    const before = await api.get<Project[]>('/projects');
    const created = await api.post<Project, CreateProjectDto>('/projects', {
      name: 'New Project',
      status: 'active',
    });
    // Seed projects are #1, #2, #3 — the next project must be #4, not a shared global id.
    expect(created.id).toBe(4);
    const after = await api.get<Project[]>('/projects');
    expect(after.length).toBe(before.length + 1);
  });

  it('PUT /projects/:id updates the project', async () => {
    const updated = await api.put<Project, { name: string }>('/projects/1', { name: 'Renamed' });
    expect(updated.name).toBe('Renamed');
  });

  it('DELETE /projects/:id cascades its tasks', async () => {
    await api.delete('/projects/1');
    const tasks = await api.get<Task[]>('/tasks');
    expect(tasks.some((t) => t.projectId === 1)).toBe(false);
  });

  it('PUT on an unknown id rejects with a NOT_FOUND ApiError', async () => {
    await expect(api.put('/projects/9999', { name: 'X' })).rejects.toMatchObject({
      code: ApiErrorCode.NotFound,
      status: 404,
    });
  });
});

describe('mock tasks API', () => {
  it('GET /tasks?projectId filters by project', async () => {
    const tasks = await api.get<Task[]>('/tasks', { params: { projectId: 1 } });
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks.every((t) => t.projectId === 1)).toBe(true);
  });

  it('GET /tasks without projectId returns all tasks', async () => {
    const scoped = await api.get<Task[]>('/tasks', { params: { projectId: 1 } });
    const all = await api.get<Task[]>('/tasks');
    expect(all.length).toBeGreaterThan(scoped.length);
  });

  it('POST /tasks appends to the lane order', async () => {
    const created = await api.post<Task, CreateTaskDto>('/tasks', {
      projectId: 2,
      title: 'Brand new task',
      status: 'todo',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      assignee: null,
    });
    expect(created.projectId).toBe(2);
    expect(typeof created.order).toBe('number');
    // Tasks use their own sequence (seed tasks end at #11 → next task is #12).
    expect(created.id).toBe(12);
  });
});

describe('corruption recovery', () => {
  it('does not throw and degrades to empty on corrupt storage', () => {
    localStorage.setItem('tms.db.projects', '{not valid json');
    expect(() => db.projects()).not.toThrow();
    expect(db.projects()).toEqual([]);
  });
});
