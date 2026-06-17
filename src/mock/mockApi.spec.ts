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

  it('POST /projects creates with a numeric incrementing id', async () => {
    const before = await api.get<Project[]>('/projects');
    const created = await api.post<Project, CreateProjectDto>('/projects', {
      name: 'New Project',
      status: 'active',
    });
    expect(typeof created.id).toBe('number');
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
  });
});

describe('corruption recovery', () => {
  it('does not throw and degrades to empty on corrupt storage', () => {
    localStorage.setItem('tms.db.projects', '{not valid json');
    expect(() => db.projects()).not.toThrow();
    expect(db.projects()).toEqual([]);
  });
});
