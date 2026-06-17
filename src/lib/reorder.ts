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

/** Status of the block a freshly-dropped row joined (neighbour before, else after). */
export function neighbourStatus(
  flat: ReadonlyArray<{ status: string }>,
  index: number,
): string | null {
  const prev = index > 0 ? flat[index - 1] : undefined;
  const next = index < flat.length - 1 ? flat[index + 1] : undefined;
  return prev?.status ?? next?.status ?? null;
}

/** How many rows of `status` precede `index` in a flat (status-grouped) list. */
export function countStatusBefore(
  flat: ReadonlyArray<{ status: string }>,
  index: number,
  status: string,
): number {
  let count = 0;
  for (let i = 0; i < index && i < flat.length; i += 1) {
    if (flat[i]?.status === status) count += 1;
  }
  return count;
}
