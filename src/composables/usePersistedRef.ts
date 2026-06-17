import { ref, watch, type Ref } from 'vue';

export interface PersistedRefOptions<T> {
  /** Coerce/merge the parsed value (e.g. fill missing keys from defaults). */
  parse?: (raw: unknown) => T;
}

/**
 * A reactive ref backed by localStorage. Corruption-safe: parse failures fall
 * back to the provided value. This is the ONLY localStorage entry point for UI
 * preferences (never for the entity DB, which lives behind the mock adapter).
 */
export function usePersistedRef<T>(
  key: string,
  fallback: T,
  options: PersistedRefOptions<T> = {},
): Ref<T> {
  const readInitial = (): T => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      const parsed: unknown = JSON.parse(raw);
      return options.parse ? options.parse(parsed) : (parsed as T);
    } catch {
      return fallback;
    }
  };

  const state = ref(readInitial()) as Ref<T>;

  watch(
    state,
    (value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Quota / disabled storage: degrade to in-memory.
      }
    },
    { deep: true, flush: 'sync' },
  );

  return state;
}
