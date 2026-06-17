import { onScopeDispose } from 'vue';

/** Debounce a void-returning function; auto-clears its timer on scope dispose. */
export function useDebounceFn<A extends unknown[]>(
  fn: (...args: A) => void,
  ms: number,
): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  onScopeDispose(() => {
    if (timer) clearTimeout(timer);
  });
  return (...args: A) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
