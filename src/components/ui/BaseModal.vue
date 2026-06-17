<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { t } from '@/i18n';

const props = withDefaults(defineProps<{ open: boolean; title: string; size?: 'sm' | 'md' }>(), {
  size: 'md',
});
const emit = defineEmits<{ close: [] }>();

const panel = ref<HTMLElement | null>(null);
let previouslyFocused: HTMLElement | null = null;

function focusables(): HTMLElement[] {
  if (!panel.value) return [];
  const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  return Array.from(panel.value.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => !el.hasAttribute('disabled'),
  );
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    emit('close');
    return;
  }
  if (event.key !== 'Tab') return;
  const items = focusables();
  if (items.length === 0) return;
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && active === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first?.focus();
  }
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      previouslyFocused = document.activeElement as HTMLElement | null;
      document.body.style.overflow = 'hidden';
      await nextTick();
      (focusables()[0] ?? panel.value)?.focus();
    } else {
      document.body.style.overflow = '';
      previouslyFocused?.focus();
    }
  },
);

onBeforeUnmount(() => {
  document.body.style.overflow = '';
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="modal" @keydown="onKeydown">
        <div class="modal__backdrop" @click="emit('close')" />
        <div
          ref="panel"
          class="modal__panel"
          :class="`modal__panel--${size}`"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          tabindex="-1"
        >
          <header class="modal__header">
            <h2 class="modal__title">{{ title }}</h2>
            <button type="button" class="modal__close" :aria-label="t('modal.close')" @click="emit('close')">
              ✕
            </button>
          </header>
          <div class="modal__body"><slot /></div>
          <footer v-if="$slots.footer" class="modal__footer"><slot name="footer" /></footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.modal {
  position: fixed;
  inset: 0;
  z-index: var(--z-overlay);
  display: grid;
  place-items: center;
  padding: var(--space-4);

  &__backdrop {
    position: absolute;
    inset: 0;
    background: var(--overlay);
    backdrop-filter: blur(2px);
  }
  &__panel {
    position: relative;
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - var(--space-7));
    &--sm {
      max-width: 420px;
    }
    &--md {
      max-width: 520px;
    }
  }
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4) var(--space-5);
    border-bottom: 1px solid var(--border);
  }
  &__title {
    font-size: var(--text-lg);
  }
  &__close {
    color: var(--text-muted);
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
    &:hover {
      background: var(--surface-hover);
      color: var(--text-strong);
    }
    &:focus-visible {
      @include focus-ring;
    }
  }
  &__body {
    padding: var(--space-5);
    overflow-y: auto;
  }
  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
    padding: var(--space-4) var(--space-5);
    border-top: 1px solid var(--border);
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--dur-base) var(--ease-standard);
}
.modal-enter-active .modal__panel,
.modal-leave-active .modal__panel {
  transition: transform var(--dur-base) var(--ease-emphasized);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal__panel,
.modal-leave-to .modal__panel {
  transform: translateY(8px) scale(0.98);
}
</style>
