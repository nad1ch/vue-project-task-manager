import { SCHEMA_VERSION, STORAGE_KEYS } from '@/constants';
import type { Project, Task } from '@/types';
import { seedProjects, seedTasks } from './seed';

interface DbMeta {
  schemaVersion: number;
  seq: number;
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
  const maxId = Math.max(0, ...projects.map((p) => p.id), ...tasks.map((t) => t.id));
  writeMeta({ schemaVersion: SCHEMA_VERSION, seq: maxId });
}

export const db = {
  /** Idempotent: seeds on first launch. */
  init(): void {
    ensureSeeded();
  },
  /** Globally unique incrementing id across projects and tasks. */
  nextId(): number {
    const meta = readMeta() ?? { schemaVersion: SCHEMA_VERSION, seq: 0 };
    const seq = meta.seq + 1;
    writeMeta({ ...meta, seq });
    return seq;
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
} as const;
