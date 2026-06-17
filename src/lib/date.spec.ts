import { describe, it, expect } from 'vitest';
import { isOverdue, isPastDate, isValidDateString, todayInputValue } from './date';
import { TaskStatus } from '@/types';

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

describe('date helpers', () => {
  it('treats today as not past', () => {
    expect(isPastDate(todayInputValue())).toBe(false);
  });
  it('treats a previous day as past', () => {
    expect(isPastDate(daysFromNow(-2))).toBe(true);
  });
  it('treats a future day as not past', () => {
    expect(isPastDate(daysFromNow(3))).toBe(false);
  });
  it('rejects invalid date strings', () => {
    expect(isValidDateString('not-a-date')).toBe(false);
    expect(isValidDateString('')).toBe(false);
  });
  it('marks overdue only when not done', () => {
    const past = daysFromNow(-3);
    expect(isOverdue(past, TaskStatus.Todo)).toBe(true);
    expect(isOverdue(past, TaskStatus.Done)).toBe(false);
  });
});
