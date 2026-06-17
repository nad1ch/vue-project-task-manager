import { TaskStatus, type TaskStatus as TaskStatusType } from '@/types';

export function nowIso(): string {
  return new Date().toISOString();
}

/** Local midnight of today. */
export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isValidDateString(value: string): boolean {
  return value.length > 0 && !Number.isNaN(Date.parse(value));
}

/** True when the date is strictly before today's local midnight. */
export function isPastDate(value: string): boolean {
  if (!isValidDateString(value)) return false;
  return new Date(value).getTime() < startOfToday().getTime();
}

/** Overdue = past due date and not yet done. */
export function isOverdue(dueDate: string, status: TaskStatusType): boolean {
  return status !== TaskStatus.Done && isPastDate(dueDate);
}

export function formatDate(value: string): string {
  if (!isValidDateString(value)) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(value));
}

/** Today as a YYYY-MM-DD string, for the `min` attribute of date inputs. */
export function todayInputValue(): string {
  const d = startOfToday();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}
