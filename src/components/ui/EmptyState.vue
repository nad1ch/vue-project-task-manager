<script setup lang="ts">
import AppIcon, { type IconName } from './AppIcon.vue';

withDefaults(defineProps<{ title: string; description?: string; icon?: IconName }>(), {
  icon: 'list',
});
</script>

<template>
  <div class="empty">
    <div class="empty__icon" aria-hidden="true">
      <AppIcon :name="icon" :size="22" />
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
  max-width: 400px;
  margin: 0 auto;
  // Subtle entrance; disabled under prefers-reduced-motion (global reset rule).
  animation: empty-in var(--dur-slow) var(--ease-standard) both;

  &__icon {
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    border-radius: var(--radius-lg);
    background: var(--surface-subtle);
    border: 1px solid var(--border-subtle);
    color: var(--text-muted);
    margin-bottom: var(--space-1);
  }
  &__title {
    font-size: var(--text-lg);
  }
  &__desc {
    color: var(--text-muted);
    font-size: var(--text-sm);
    line-height: var(--leading-normal);
  }
  &__actions {
    margin-top: var(--space-3);
    display: flex;
    gap: var(--space-2);
  }
}

@keyframes empty-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
