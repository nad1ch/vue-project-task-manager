import { onScopeDispose, ref, type Ref } from 'vue';
import type { ColumnWidths } from '@/types';

export interface ResizableColumnsOptions<K extends string> {
  widths: () => ColumnWidths<K>;
  onCommit: (key: K, width: number) => void;
  min?: number;
  max?: number;
  fallback?: number;
}

export interface UseResizableColumns<K extends string> {
  isResizing: Ref<boolean>;
  widthFor: (key: K) => number;
  startResize: (key: K, event: PointerEvent) => void;
}

/** Owns the pointer-drag column resize interaction; commits the final width once on release. */
export function useResizableColumns<K extends string>(
  options: ResizableColumnsOptions<K>,
): UseResizableColumns<K> {
  const min = options.min ?? 80;
  const max = options.max ?? 720;
  const fallback = options.fallback ?? 160;

  const isResizing = ref(false);
  const live = ref<Partial<Record<K, number>>>({});

  let activeKey: K | null = null;
  let startX = 0;
  let startWidth = 0;

  function widthFor(key: K): number {
    return live.value[key] ?? options.widths()[key] ?? fallback;
  }

  function onMove(event: PointerEvent): void {
    if (activeKey === null) return;
    const next = Math.max(min, Math.min(max, startWidth + (event.clientX - startX)));
    live.value = { ...live.value, [activeKey]: next };
  }

  function teardown(): void {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    isResizing.value = false;
    activeKey = null;
    live.value = {};
  }

  function onUp(): void {
    if (activeKey !== null) {
      const width = live.value[activeKey];
      if (width !== undefined) options.onCommit(activeKey, Math.round(width));
    }
    teardown();
  }

  function startResize(key: K, event: PointerEvent): void {
    event.preventDefault();
    event.stopPropagation();
    activeKey = key;
    startX = event.clientX;
    startWidth = widthFor(key);
    isResizing.value = true;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  onScopeDispose(teardown);

  return { isResizing, widthFor, startResize };
}
