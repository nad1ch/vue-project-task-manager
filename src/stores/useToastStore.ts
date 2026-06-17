import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Toast, ToastVariant } from '@/types';

const DEFAULT_TIMEOUT = 4000;
const ERROR_TIMEOUT = 6000;

export const useToastStore = defineStore('toast', () => {
  const items = ref<Toast[]>([]);
  let seq = 0;

  function dismiss(id: number): void {
    items.value = items.value.filter((t) => t.id !== id);
  }

  function push(variant: ToastVariant, message: string, timeout: number): number {
    const id = ++seq;
    // De-dupe identical back-to-back messages.
    if (items.value.some((t) => t.variant === variant && t.message === message)) return id;
    items.value = [...items.value, { id, variant, message, timeout }];
    if (timeout > 0) {
      setTimeout(() => dismiss(id), timeout);
    }
    return id;
  }

  const success = (message: string): number => push('success', message, DEFAULT_TIMEOUT);
  const error = (message: string): number => push('error', message, ERROR_TIMEOUT);
  const info = (message: string): number => push('info', message, DEFAULT_TIMEOUT);
  const warning = (message: string): number => push('warning', message, DEFAULT_TIMEOUT);

  return { items, push, success, error, info, warning, dismiss };
});
