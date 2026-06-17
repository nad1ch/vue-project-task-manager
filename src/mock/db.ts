import { SCHEMA_VERSION, STORAGE_KEYS } from '@/constants';
import type { Project, Task } from '@/types';
import { seedProjects, seedTasks } from './seed';

interface DbMeta {
  schemaVersion: number;
  /** Separate per-entity id sequences. */
  projectSeq?: number;
  taskSeq?: number;
  /** Legacy single sequence (pre-split); retained for safe migration. */
  seq?: number;
}

function maxId(rows: ReadonlyArray<{ id: number }>): number {
  return rows.reduce((max, row) => Math.max(max, row.id), 0);
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    // Corrupted JSON: degrade to fallback instead of crashing.
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded / storage disabled: silently degrade (mock stays in-memory for the call).
  }
}

function readMeta(): DbMeta | null {
  return read<DbMeta | null>(STORAGE_KEYS.meta, null);
}

function writeMeta(meta: DbMeta): void {
  write(STORAGE_KEYS.meta, meta);
}

/** Seed only on first launch or when the schema version changed. */
function ensureSeeded(): void {
  const meta = readMeta();
  if (meta && meta.schemaVersion === SCHEMA_VERSION) return;
  const projects = seedProjects();
  const tasks = seedTasks();
  write(STORAGE_KEYS.projects, projects);
  write(STORAGE_KEYS.tasks, tasks);
  writeMeta({
    schemaVersion: SCHEMA_VERSION,
    projectSeq: maxId(projects),
    taskSeq: maxId(tasks),
  });
}

/** Next id for an entity type, derived from stored max if no counter exists yet (migration-safe). */
function nextSeq(kind: 'project' | 'task'): number {
  const meta = readMeta() ?? { schemaVersion: SCHEMA_VERSION };
  const current =
    kind === 'project'
      ? (meta.projectSeq ?? maxId(read<Project[]>(STORAGE_KEYS.projects, [])))
      : (meta.taskSeq ?? maxId(read<Task[]>(STORAGE_KEYS.tasks, [])));
  const next = current + 1;
  writeMeta({
    ...meta,
    schemaVersion: SCHEMA_VERSION,
    ...(kind === 'project' ? { projectSeq: next } : { taskSeq: next }),
  });
  return next;
}

export const db = {
  /** Idempotent: seeds on first launch. */
  init(): void {
    ensureSeeded();
  },
  /** Next project id (its own sequence). */
  nextProjectId(): number {
    return nextSeq('project');
  },
  /** Next task id (its own sequence). */
  nextTaskId(): number {
    return nextSeq('task');
  },
  projects(): Project[] {
    return read<Project[]>(STORAGE_KEYS.projects, []);
  },
  tasks(): Task[] {
    return read<Task[]>(STORAGE_KEYS.tasks, []);
  },
  saveProjects(rows: Project[]): void {
    write(STORAGE_KEYS.projects, rows);
  },
  saveTasks(rows: Task[]): void {
    write(STORAGE_KEYS.tasks, rows);
  },
  /** Clear the persisted dataset and re-seed (demo reset). */
  reset(): void {
    for (const key of [STORAGE_KEYS.projects, STORAGE_KEYS.tasks, STORAGE_KEYS.meta]) {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
    }
    ensureSeeded();
  },
} as const;
