import { SortDirection, type SortDirection as SortDirectionType } from '@/types';

export type Comparator<T> = (a: T, b: T) => number;

export function compareStrings(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

export function compareNumbers(a: number, b: number): number {
  return a - b;
}

export function compareDates(a: string, b: string): number {
  return Date.parse(a) - Date.parse(b);
}

/** Wrap a base (ascending) comparator with a direction. */
export function withDirection<T>(cmp: Comparator<T>, direction: SortDirectionType): Comparator<T> {
  return direction === SortDirection.Asc ? cmp : (a, b) => -cmp(a, b);
}

/** Stable sort returning a new array (Array.prototype.sort is stable in modern engines). */
export function sortBy<T>(rows: readonly T[], cmp: Comparator<T>): T[] {
  return [...rows].sort(cmp);
}

/** Comparator over a list of comparators: first non-zero wins (tie-break chain). */
export function chain<T>(...comparators: ReadonlyArray<Comparator<T>>): Comparator<T> {
  return (a, b) => {
    for (const cmp of comparators) {
      const result = cmp(a, b);
      if (result !== 0) return result;
    }
    return 0;
  };
}
