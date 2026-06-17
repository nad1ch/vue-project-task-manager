import { describe, it, expect } from 'vitest';
import { chain, compareDates, compareNumbers, compareStrings, sortBy, withDirection } from './compare';
import { SortDirection } from '@/types';

describe('comparators', () => {
  it('sorts strings numerically-aware', () => {
    const input = ['Project 10', 'Project 2', 'Project 1'];
    expect(sortBy(input, compareStrings)).toEqual(['Project 1', 'Project 2', 'Project 10']);
  });
  it('compares numbers and dates', () => {
    expect(compareNumbers(1, 2)).toBeLessThan(0);
    expect(compareDates('2026-01-01', '2026-02-01')).toBeLessThan(0);
  });
  it('applies direction', () => {
    const desc = withDirection(compareNumbers, SortDirection.Desc);
    expect(sortBy([1, 3, 2], desc)).toEqual([3, 2, 1]);
  });
  it('chains comparators as a tie-break', () => {
    const rows = [
      { group: 1, order: 2 },
      { group: 1, order: 1 },
      { group: 0, order: 9 },
    ];
    const cmp = chain<{ group: number; order: number }>(
      (a, b) => compareNumbers(a.group, b.group),
      (a, b) => compareNumbers(a.order, b.order),
    );
    expect(sortBy(rows, cmp)).toEqual([
      { group: 0, order: 9 },
      { group: 1, order: 1 },
      { group: 1, order: 2 },
    ]);
  });
});
