<script setup lang="ts">
import type { Tone } from '@/types';

defineProps<{ label: string; tone: Tone; dot?: boolean }>();
</script>

<template>
  <span class="badge" :class="`badge--${tone}`">
    <span v-if="dot !== false" class="badge__dot" aria-hidden="true" />
    {{ label }}
  </span>
</template>

<style scoped lang="scss">
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: var(--radius-pill);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  line-height: 1.5;
  white-space: nowrap;

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }

  &--neutral {
    background: var(--surface-subtle);
    color: var(--text-muted);
  }
  &--success {
    background: var(--success-soft);
    color: var(--success);
  }
  &--info {
    background: var(--info-soft);
    color: var(--info);
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
</style>
