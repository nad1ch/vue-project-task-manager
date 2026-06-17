<script setup lang="ts">
defineProps<{ label: string; danger?: boolean }>();
</script>

<template>
  <button type="button" class="icon-btn" :class="{ 'icon-btn--danger': danger }" :aria-label="label" :title="label">
    <slot />
  </button>
</template>

<style scoped lang="scss">
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  transition: background var(--dur-fast), color var(--dur-fast);

  &:hover {
    background: var(--surface-hover);
    color: var(--text-strong);
  }
  &:focus-visible {
    @include focus-ring;
  }
  &--danger:hover {
    background: var(--danger-soft);
    color: var(--danger);
  }
}
</style>
