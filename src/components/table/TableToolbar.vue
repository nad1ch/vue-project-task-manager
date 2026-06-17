<script setup lang="ts">
defineProps<{ count: number; total: number; noun?: string }>();
</script>

<template>
  <div class="toolbar">
    <div class="toolbar__filters">
      <slot name="filters" />
    </div>
    <div class="toolbar__right">
      <span class="toolbar__count">
        {{ count }} of {{ total }} {{ noun ?? 'items' }}
      </span>
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-4);
  border-bottom: 1px solid var(--border);

  &__filters {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: var(--space-3);
  }
  &__right {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
  &__count {
    font-size: var(--text-xs);
    color: var(--text-muted);
    white-space: nowrap;
  }
}
</style>
