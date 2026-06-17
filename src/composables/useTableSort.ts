import { computed, type ComputedRef } from 'vue';
import { sortBy, withDirection, type Comparator } from '@/lib/compare';
import type { SortDescriptor } from '@/types';

export type AriaSort = 'ascending' | 'descending' | 'none';

/**
 * Derive a sorted view from rows + a (possibly null) sort descriptor.
 * `null` descriptor means "natural order" — rows are returned as-is.
 */
export function useTableSort<Row, K extends string>(
  rows: () => readonly Row[],
  sort: () => SortDescriptor<K> | null,
  comparators: Record<K, Comparator<Row>>,
): { sortedRows: ComputedRef<Row[]>; ariaSort: (key: K) => AriaSort } {
  const sortedRows = computed<Row[]>(() => {
    const descriptor = sort();
    if (!descriptor) return [...rows()];
    return sortBy(rows(), withDirection(comparators[descriptor.key], descriptor.direction));
  });

  function ariaSort(key: K): AriaSort {
    const descriptor = sort();
    if (!descriptor || descriptor.key !== key) return 'none';
    return descriptor.direction === 'asc' ? 'ascending' : 'descending';
  }

  return { sortedRows, ariaSort };
}
