import { describe, it, expect } from 'vitest';
import { countStatusBefore, moveItem, neighbourStatus, sequentialOrderChanges } from './reorder';

describe('moveItem', () => {
  it('moves an item forward', () => {
    expect(moveItem([1, 2, 3, 4], 0, 2)).toEqual([2, 3, 1, 4]);
  });
  it('moves an item backward', () => {
    expect(moveItem([1, 2, 3, 4], 3, 1)).toEqual([1, 4, 2, 3]);
  });
  it('clamps the target index', () => {
    expect(moveItem([1, 2, 3], 0, 99)).toEqual([2, 3, 1]);
  });
  it('returns a copy and no-ops when source index is out of range', () => {
    const input = [1, 2];
    const result = moveItem(input, 5, 0);
    expect(result).toEqual([1, 2]);
    expect(result).not.toBe(input);
  });
});

describe('sequentialOrderChanges', () => {
  it('produces contiguous 0-based orders for changed entries only', () => {
    const lane = [
      { id: 10, order: 5 },
      { id: 11, order: 2 },
      { id: 12, order: 9 },
    ];
    expect(sequentialOrderChanges(lane)).toEqual([
      { id: 10, order: 0 },
      { id: 11, order: 1 },
      { id: 12, order: 2 },
    ]);
  });
  it('returns no changes when already sequential', () => {
    const lane = [
      { id: 1, order: 0 },
      { id: 2, order: 1 },
    ];
    expect(sequentialOrderChanges(lane)).toEqual([]);
  });
});

describe('flat-table DnD helpers', () => {
  const flat = [
    { status: 'todo' },
    { status: 'todo' },
    { status: 'in_progress' },
    { status: 'done' },
  ];

  it('detects the neighbouring block status', () => {
    expect(neighbourStatus(flat, 0)).toBe('todo');
    expect(neighbourStatus(flat, 2)).toBe('todo'); // joined after a todo
    expect(neighbourStatus(flat, 3)).toBe('in_progress');
    expect(neighbourStatus([], 0)).toBeNull();
  });

  it('counts same-status rows before an index', () => {
    expect(countStatusBefore(flat, 2, 'todo')).toBe(2);
    expect(countStatusBefore(flat, 3, 'in_progress')).toBe(1);
    expect(countStatusBefore(flat, 0, 'todo')).toBe(0);
  });
});
