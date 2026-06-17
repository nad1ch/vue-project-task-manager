import { describe, it, expect } from 'vitest';

// Phase 0 smoke test: confirms the Vitest pipeline runs.
describe('sanity', () => {
  it('runs the test runner', () => {
    expect(1 + 1).toBe(2);
  });
});
