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

/**
 * Parse a date string. Date-only strings (`YYYY-MM-DD`) are treated as a LOCAL
 * calendar date (not UTC), so "today" is never off by one across time zones.
 */
function parseDate(value: string): Date {
  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
  }
  return new Date(value);
}

export function isValidDateString(value: string): boolean {
  return value.length > 0 && !Number.isNaN(parseDate(value).getTime());
}

/** True when the date's local calendar day is before today. */
export function isPastDate(value: string): boolean {
  if (!isValidDateString(value)) return false;
  const d = parseDate(value);
  const localMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return localMidnight.getTime() < startOfToday().getTime();
}

/** Overdue = past due date and not yet done. */
export function isOverdue(dueDate: string, status: TaskStatusType): boolean {
  return status !== TaskStatus.Done && isPastDate(dueDate);
}

export function formatDate(value: string, localeTag = 'en-GB'): string {
  if (!isValidDateString(value)) return '—';
  return new Intl.DateTimeFormat(localeTag, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(parseDate(value));
}

/** Today as a `YYYY-MM-DD` string, for the `min` attribute of date inputs. */
export function todayInputValue(): string {
  return toDateInputValue(nowIso());
}

/** Convert any stored date string to a `YYYY-MM-DD` value for a date input. */
export function toDateInputValue(value: string): string {
  if (!isValidDateString(value)) return '';
  const d = parseDate(value);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}
