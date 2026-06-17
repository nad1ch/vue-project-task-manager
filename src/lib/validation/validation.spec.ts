import { describe, it, expect } from 'vitest';
import { projectSchema } from './projectSchema';
import { taskCreateSchema, taskUpdateSchema } from './taskSchema';

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

describe('projectSchema', () => {
  it('accepts a valid project', () => {
    expect(projectSchema.safeParse({ name: 'Website', status: 'active' }).success).toBe(true);
  });
  it('rejects a too-short name', () => {
    expect(projectSchema.safeParse({ name: 'A', status: 'active' }).success).toBe(false);
  });
  it('rejects an unknown status', () => {
    expect(projectSchema.safeParse({ name: 'Valid', status: 'paused' }).success).toBe(false);
  });
  it('allows an omitted description', () => {
    const result = projectSchema.safeParse({ name: 'Valid', status: 'archived' });
    expect(result.success).toBe(true);
  });
});

describe('taskCreateSchema', () => {
  it('accepts a valid task with a future due date', () => {
    const result = taskCreateSchema.safeParse({
      title: 'Write tests',
      status: 'todo',
      assignee: 'Bohdan',
      dueDate: daysFromNow(3),
    });
    expect(result.success).toBe(true);
  });
  it('rejects a past due date', () => {
    const result = taskCreateSchema.safeParse({
      title: 'Write tests',
      status: 'todo',
      assignee: null,
      dueDate: daysFromNow(-2),
    });
    expect(result.success).toBe(false);
  });
  it('rejects a too-short title', () => {
    expect(
      taskCreateSchema.safeParse({ title: 'ab', status: 'todo', assignee: null, dueDate: daysFromNow(1) })
        .success,
    ).toBe(false);
  });
  it('rejects an assignee outside the list', () => {
    expect(
      taskCreateSchema.safeParse({
        title: 'Valid title',
        status: 'todo',
        assignee: 'Unknown',
        dueDate: daysFromNow(1),
      }).success,
    ).toBe(false);
  });
});

describe('taskUpdateSchema', () => {
  it('accepts an order-only patch', () => {
    expect(taskUpdateSchema.safeParse({ order: 3 }).success).toBe(true);
  });
  it('allows a past due date when editing (no past-date rule)', () => {
    expect(taskUpdateSchema.safeParse({ dueDate: daysFromNow(-5) }).success).toBe(true);
  });
  it('still rejects an invalid due date', () => {
    expect(taskUpdateSchema.safeParse({ dueDate: 'nope' }).success).toBe(false);
  });
});
