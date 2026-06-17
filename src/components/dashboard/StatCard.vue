<script setup lang="ts">
import type { Tone } from '@/types';

withDefaults(defineProps<{ label: string; value: number | string; tone?: Tone; hint?: string }>(), {
  tone: 'neutral',
});
</script>

<template>
  <div class="stat">
    <div class="stat__top">
      <span class="stat__label">{{ label }}</span>
      <span class="stat__icon" :class="`stat__icon--${tone}`" aria-hidden="true">
        <slot name="icon">●</slot>
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
  padding: var(--space-4);
  box-shadow: var(--shadow-xs);

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  &__label {
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-muted);
  }
  &__icon {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
    font-size: 12px;
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
    margin-top: var(--space-3);
    font-size: var(--text-3xl);
    font-weight: var(--weight-semibold);
    color: var(--text-strong);
  }
  &__hint {
    margin-top: 2px;
    font-size: var(--text-xs);
    color: var(--text-muted);
  }
}
</style>
