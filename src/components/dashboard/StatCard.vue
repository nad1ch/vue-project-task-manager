<script setup lang="ts">
import type { Tone } from '@/types';
import AppIcon, { type IconName } from '@/components/ui/AppIcon.vue';

withDefaults(
  defineProps<{ label: string; value: number | string; icon: IconName; tone?: Tone; hint?: string }>(),
  { tone: 'neutral' },
);
</script>

<template>
  <div class="stat">
    <div class="stat__top">
      <span class="stat__label">{{ label }}</span>
      <span class="stat__icon" :class="`stat__icon--${tone}`">
        <AppIcon :name="icon" :size="16" />
      </span>
    </div>
    <div class="stat__value tabular">{{ value }}</div>
    <div v-if="hint" class="stat__hint">{{ hint }}</div>
  </div>
</template>

<style scoped lang="scss">
.stat {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-5);
  box-shadow: var(--shadow-sm);
  transition:
    transform var(--dur-fast),
    box-shadow var(--dur-fast);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  &__label {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
  }
  &__icon {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    &--neutral {
      background: var(--surface-subtle);
      color: var(--text-muted);
    }
    &--info {
      background: var(--info-soft);
      color: var(--info);
    }
    &--success {
      background: var(--success-soft);
      color: var(--success);
    }
    &--warning {
      background: var(--warning-soft);
      color: var(--warning);
    }
    &--danger {
      background: var(--danger-soft);
      color: var(--danger);
    }
  }
  &__value {
    margin-top: var(--space-4);
    font-size: var(--text-3xl);
    font-weight: var(--weight-semibold);
    letter-spacing: -0.02em;
    color: var(--text-strong);
    line-height: 1.1;
  }
  &__hint {
    margin-top: var(--space-2);
    font-size: var(--text-xs);
    color: var(--text-muted);
  }
}
</style>
