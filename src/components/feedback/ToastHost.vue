<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useToastStore } from '@/stores/useToastStore';
import { t } from '@/i18n';

const toastStore = useToastStore();
const { items } = storeToRefs(toastStore);
</script>

<template>
  <Teleport to="body">
    <div class="toasts" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="toast">
        <div
          v-for="toast in items"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.variant}`"
          :role="toast.variant === 'error' ? 'alert' : 'status'"
        >
          <span class="toast__dot" aria-hidden="true" />
          <span class="toast__message">{{ toast.message }}</span>
          <button
            type="button"
            class="toast__close"
            :aria-label="t('common.dismiss')"
            @click="toastStore.dismiss(toast.id)"
          >
            ✕
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.toasts {
  position: fixed;
  right: var(--space-5);
  bottom: var(--space-5);
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-width: 360px;
}
.toast {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--surface-raised);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  font-size: var(--text-sm);
  color: var(--text-strong);

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  &__message {
    flex: 1;
  }
  &__close {
    color: var(--text-faint);
    &:hover {
      color: var(--text-strong);
    }
  }
  &--success .toast__dot {
    background: var(--success);
  }
  &--error .toast__dot {
    background: var(--danger);
  }
  &--info .toast__dot {
    background: var(--info);
  }
  &--warning .toast__dot {
    background: var(--warning);
  }
}

.toast-enter-active,
.toast-leave-active {
  transition:
    transform var(--dur-base) var(--ease-emphasized),
    opacity var(--dur-base) var(--ease-standard);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
