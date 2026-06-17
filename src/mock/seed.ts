import { ProjectStatus, TaskStatus, type Project, type Task } from '@/types';

function isoDaysFromNow(days: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function isoDaysAgo(days: number): string {
  return isoDaysFromNow(-days);
}

/** Deterministic seed: ids are globally unique across projects and tasks. */
export function seedProjects(): Project[] {
  const created = isoDaysAgo(20);
  return [
    { id: 1, name: 'Website Redesign', description: 'Marketing site refresh and CMS migration.', status: ProjectStatus.Active, createdAt: created, updatedAt: created },
    { id: 2, name: 'Mobile App', description: 'iOS and Android MVP for the customer portal.', status: ProjectStatus.Active, createdAt: isoDaysAgo(14), updatedAt: isoDaysAgo(14) },
    { id: 3, name: 'Internal Tooling', status: ProjectStatus.Archived, createdAt: isoDaysAgo(60), updatedAt: isoDaysAgo(40) },
  ];
}

export function seedTasks(): Task[] {
  const base = isoDaysAgo(10);
  return [
    // Project 1
    { id: 4, projectId: 1, title: 'Audit current pages', status: TaskStatus.Done, order: 0, dueDate: isoDaysAgo(5), assignee: 'Olena', createdAt: base, updatedAt: base },
    { id: 5, projectId: 1, title: 'Design system tokens', status: TaskStatus.InProgress, order: 0, dueDate: isoDaysFromNow(3), assignee: 'Bohdan', createdAt: base, updatedAt: base },
    { id: 6, projectId: 1, title: 'Build component library', status: TaskStatus.Todo, order: 0, dueDate: isoDaysFromNow(9), assignee: 'Bohdan', createdAt: base, updatedAt: base },
    { id: 7, projectId: 1, title: 'CMS migration plan', status: TaskStatus.Todo, order: 1, dueDate: isoDaysFromNow(14), assignee: null, createdAt: base, updatedAt: base },
    // Project 2
    { id: 8, projectId: 2, title: 'Set up CI pipeline', status: TaskStatus.InProgress, order: 0, dueDate: isoDaysFromNow(2), assignee: 'Ihor', createdAt: base, updatedAt: base },
    { id: 9, projectId: 2, title: 'Auth flow', status: TaskStatus.Todo, order: 0, dueDate: isoDaysFromNow(6), assignee: 'Maria', createdAt: base, updatedAt: base },
    { id: 10, projectId: 2, title: 'Push notifications', status: TaskStatus.Todo, order: 1, dueDate: isoDaysFromNow(12), assignee: null, createdAt: base, updatedAt: base },
    // Project 3 (archived) — one done task
    { id: 11, projectId: 3, title: 'Decommission legacy dashboard', status: TaskStatus.Done, order: 0, dueDate: isoDaysAgo(35), assignee: 'Andrii', createdAt: isoDaysAgo(50), updatedAt: isoDaysAgo(40) },
  ];
}
