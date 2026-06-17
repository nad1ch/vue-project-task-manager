<script setup lang="ts">
import type { Tone } from '@/types';

defineProps<{ label: string; tone: Tone; count: number }>();
defineEmits<{ add: [] }>();
</script>

<template>
  <section class="kcol">
    <header class="kcol__head">
      <span class="kcol__dot" :class="`kcol__dot--${tone}`" aria-hidden="true" />
      <span class="kcol__name">{{ label }}</span>
      <span class="kcol__count">{{ count }}</span>
    </header>
    <div class="kcol__body">
      <slot />
    </div>
    <button type="button" class="kcol__add" @click="$emit('add')">+ Add task</button>
  </section>
</template>

<style scoped lang="scss">
.kcol {
  display: flex;
  flex-direction: column;
  min-width: 300px;
  width: 300px;
  background: var(--surface-subtle);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  max-height: 100%;

  &__head {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
  }
  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    &--neutral {
      background: var(--text-faint);
    }
    &--info {
      background: var(--info);
    }
    &--success {
      background: var(--success);
    }
    &--warning {
      background: var(--warning);
    }
    &--danger {
      background: var(--danger);
    }
  }
  &__name {
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    color: var(--text-strong);
  }
  &__count {
    margin-left: auto;
    min-width: 22px;
    height: 20px;
    padding: 0 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-pill);
    background: var(--surface);
    border: 1px solid var(--border);
    font-size: var(--text-xs);
    color: var(--text-muted);
  }
  &__body {
    flex: 1;
    overflow-y: auto;
    padding: 0 var(--space-3) var(--space-3);
  }
  &__add {
    margin: 0 var(--space-3) var(--space-3);
    padding: var(--space-2);
    border-radius: var(--radius-sm);
    border: 1px dashed var(--border-strong);
    color: var(--text-muted);
    font-size: var(--text-sm);
    &:hover {
      background: var(--surface-hover);
      color: var(--text-strong);
    }
    &:focus-visible {
      @include focus-ring;
    }
  }
}
</style>
