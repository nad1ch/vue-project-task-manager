/** Immutably move an item from one index to another, clamping the target. */
export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const next = [...items];
  if (from < 0 || from >= next.length) return next;
  const removed = next.splice(from, 1);
  const moved = removed[0];
  if (moved === undefined) return next;
  const target = Math.max(0, Math.min(to, next.length));
  next.splice(target, 0, moved);
  return next;
}

export interface OrderChange {
  id: number;
  order: number;
}

/**
 * Given a lane already in its desired visual order, return the (id -> order)
 * changes needed so `order` is contiguous and 0-based. Only changed entries
 * are returned to minimise persistence writes.
 */
export function sequentialOrderChanges<T extends { id: number; order: number }>(
  lane: readonly T[],
): OrderChange[] {
  const changes: OrderChange[] = [];
  lane.forEach((item, index) => {
    if (item.order !== index) changes.push({ id: item.id, order: index });
  });
  return changes;
}
