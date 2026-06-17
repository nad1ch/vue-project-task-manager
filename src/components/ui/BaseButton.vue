<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    type?: 'button' | 'submit';
    loading?: boolean;
    disabled?: boolean;
    block?: boolean;
  }>(),
  { variant: 'secondary', type: 'button', loading: false, disabled: false, block: false },
);
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="btn"
    :class="[`btn--${variant}`, { 'btn--block': block }]"
  >
    <span v-if="loading" class="btn__spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped lang="scss">
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  height: 38px;
  padding: 0 var(--space-4);
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  white-space: nowrap;
  transition:
    background var(--dur-fast) var(--ease-standard),
    border-color var(--dur-fast) var(--ease-standard),
    color var(--dur-fast) var(--ease-standard);

  &:focus-visible {
    @include focus-ring;
  }
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
  &:active:not(:disabled) {
    transform: translateY(1px);
  }
  &--block {
    width: 100%;
  }

  &--primary {
    background: var(--accent);
    color: var(--accent-contrast);
    &:hover:not(:disabled) {
      background: var(--accent-hover);
    }
  }
  &--secondary {
    background: var(--surface);
    border-color: var(--border-strong);
    color: var(--text-strong);
    &:hover:not(:disabled) {
      background: var(--surface-hover);
    }
  }
  &--ghost {
    background: transparent;
    color: var(--text-muted);
    &:hover:not(:disabled) {
      background: var(--surface-hover);
      color: var(--text-strong);
    }
  }
  &--danger {
    background: var(--danger);
    color: #fff;
    &:hover:not(:disabled) {
      filter: brightness(0.94);
    }
  }

  &__spinner {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid currentColor;
    border-top-color: transparent;
    animation: btn-spin 0.6s linear infinite;
  }
}

@keyframes btn-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
