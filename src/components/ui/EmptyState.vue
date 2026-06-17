<script setup lang="ts">
defineProps<{ title: string; description?: string }>();
</script>

<template>
  <div class="empty">
    <div class="empty__icon" aria-hidden="true">
      <slot name="icon">◍</slot>
    </div>
    <h3 class="empty__title">{{ title }}</h3>
    <p v-if="description" class="empty__desc">{{ description }}</p>
    <div v-if="$slots.actions" class="empty__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-2);
  padding: var(--space-7) var(--space-5);
  max-width: 380px;
  margin: 0 auto;

  &__icon {
    display: grid;
    place-items: center;
    width: 48px;
    height: 48px;
    border-radius: var(--radius-lg);
    background: var(--surface-subtle);
    color: var(--text-faint);
    font-size: 22px;
    margin-bottom: var(--space-1);
  }
  &__title {
    font-size: var(--text-lg);
  }
  &__desc {
    color: var(--text-muted);
    font-size: var(--text-sm);
  }
  &__actions {
    margin-top: var(--space-3);
    display: flex;
    gap: var(--space-2);
  }
}
</style>
