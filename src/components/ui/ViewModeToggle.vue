<script setup lang="ts">
import { ViewMode, type ViewMode as ViewModeType } from '@/types';

defineProps<{ modelValue: ViewModeType }>();
const emit = defineEmits<{ 'update:modelValue': [ViewModeType] }>();
</script>

<template>
  <div class="seg" role="group" aria-label="View mode">
    <button
      type="button"
      class="seg__btn"
      :class="{ 'seg__btn--active': modelValue === ViewMode.Table }"
      :aria-pressed="modelValue === ViewMode.Table"
      @click="emit('update:modelValue', ViewMode.Table)"
    >
      Table
    </button>
    <button
      type="button"
      class="seg__btn"
      :class="{ 'seg__btn--active': modelValue === ViewMode.Kanban }"
      :aria-pressed="modelValue === ViewMode.Kanban"
      @click="emit('update:modelValue', ViewMode.Kanban)"
    >
      Kanban
    </button>
  </div>
</template>

<style scoped lang="scss">
.seg {
  display: inline-flex;
  padding: 3px;
  gap: 2px;
  background: var(--surface-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);

  &__btn {
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-sm);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--text-muted);
    &:hover {
      color: var(--text-strong);
    }
    &:focus-visible {
      @include focus-ring;
    }
    &--active {
      background: var(--surface-raised);
      color: var(--text-strong);
      box-shadow: var(--shadow-xs);
    }
  }
}
</style>
