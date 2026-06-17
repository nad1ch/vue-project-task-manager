<script setup lang="ts">
import { useResizableColumns } from '@/composables/useResizableColumns';
import type { AriaSort } from '@/composables/useTableSort';
import type { ColumnWidths, TableColumn } from '@/types';
import { t } from '@/i18n';

// Non-generic on purpose: the parent renders fully-typed rows via the default
// slot, so cell typing stays strict in the page while this component owns the
// header, sorting affordance and resizable columns.
const props = defineProps<{
  columns: TableColumn<string>[];
  widths: ColumnWidths<string>;
  getAriaSort: (key: string) => AriaSort;
  hasActions?: boolean;
  /** Pin the actions column to the right edge so it stays visible while scrolling. */
  stickyActions?: boolean;
}>();

const emit = defineEmits<{ 'toggle-sort': [string]; resize: [string, number] }>();

const { startResize, widthFor } = useResizableColumns<string>({
  widths: () => props.widths,
  onCommit: (key, width) => emit('resize', key, width),
});
</script>

<template>
  <div class="dt" :class="{ 'dt--sticky-actions': stickyActions }">
    <table class="dt__table">
      <colgroup>
        <col v-for="col in columns" :key="col.key" :style="{ width: `${widthFor(col.key)}px` }" />
        <col v-if="hasActions" style="width: 104px" />
      </colgroup>
      <thead class="dt__head">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            scope="col"
            class="dt__th"
            :class="`dt__th--${col.align ?? 'left'}`"
            :aria-sort="col.sortable ? getAriaSort(col.key) : undefined"
          >
            <button
              v-if="col.sortable"
              type="button"
              class="dt__sort"
              @click="emit('toggle-sort', col.key)"
            >
              <span>{{ col.label }}</span>
              <span class="dt__sort-icon" :data-state="getAriaSort(col.key)">↕</span>
            </button>
            <span v-else>{{ col.label }}</span>
            <span
              class="dt__resizer"
              role="separator"
              aria-orientation="vertical"
              @pointerdown="startResize(col.key, $event)"
            />
          </th>
          <th v-if="hasActions" scope="col" class="dt__th dt__th--right dt__th--actions">
            <span class="dt__sr">{{ t('common.actions') }}</span>
          </th>
        </tr>
      </thead>
      <slot />
    </table>
  </div>
</template>

<style scoped lang="scss">
.dt {
  overflow-x: auto;

  &__table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  &__head {
    position: sticky;
    top: 0;
    z-index: 1;
  }
  &__th {
    position: relative;
    height: 40px;
    padding: 0 var(--space-4);
    text-align: left;
    background: var(--surface-raised);
    border-bottom: 1px solid var(--border);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.03em;
    user-select: none;
    &--right {
      text-align: right;
    }
    &--center {
      text-align: center;
    }
  }
  &__sort {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: inherit;
    font: inherit;
    text-transform: inherit;
    letter-spacing: inherit;
    &:hover {
      color: var(--text-strong);
    }
    &:focus-visible {
      @include focus-ring;
    }
  }
  &__sort-icon {
    font-size: 10px;
    opacity: 0.4;
    &[data-state='ascending'],
    &[data-state='descending'] {
      opacity: 1;
      color: var(--accent);
    }
    &[data-state='descending'] {
      transform: scaleY(-1);
    }
  }
  &__resizer {
    position: absolute;
    top: 0;
    right: -3px;
    width: 8px;
    height: 100%;
    cursor: col-resize;
    touch-action: none;
    &:hover::after {
      content: '';
      position: absolute;
      top: 8px;
      bottom: 8px;
      right: 3px;
      width: 2px;
      background: var(--accent);
    }
  }
  &__sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }

  // Slotted rows (and their tbody) live in the parent's scope; style via :deep.
  :deep(tbody tr) {
    border-bottom: 1px solid var(--border-subtle);
  }
  :deep(tbody tr.dt-row--clickable) {
    cursor: pointer;
  }
  :deep(tbody tr:hover) {
    background: var(--surface-hover);
  }
  :deep(tbody td) {
    height: 48px;
    padding: 0 var(--space-4);
    font-size: var(--text-sm);
    color: var(--text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  :deep(tbody td.dt-cell--right) {
    text-align: right;
  }
  :deep(tbody tr.dt-row--group) {
    cursor: default;
    background: var(--surface-subtle);
  }
  :deep(tbody tr.dt-row--group:hover) {
    background: var(--surface-subtle);
  }
  :deep(tbody td.dt-group-cell) {
    height: 34px;
    font-size: var(--text-2xs);
    font-weight: var(--weight-semibold);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-muted);
  }
  :deep(.dt-drag-ghost) {
    opacity: 0.5;
  }
  :deep(.dt-drag-chosen) {
    background: var(--accent-soft);
  }
}

// Pin the actions column so Open/Edit/Delete stay visible while the table
// scrolls horizontally. The soft left shadow both separates the column and
// hints that content scrolls beneath it. Backgrounds match each context
// (header = raised, rows = surface) so they're seamless in light and dark.
.dt--sticky-actions {
  .dt__th--actions {
    position: sticky;
    right: 0;
    z-index: 2;
    background: var(--surface-raised);
    box-shadow: -10px 0 12px -10px hsl(var(--shadow-color) / 0.22);
  }
  :deep(tbody td:last-child) {
    position: sticky;
    right: 0;
    z-index: 1;
    background: var(--surface);
    box-shadow: -10px 0 12px -10px hsl(var(--shadow-color) / 0.22);
  }
  :deep(tbody tr:hover td:last-child) {
    background: var(--surface-hover);
  }
}
</style>
