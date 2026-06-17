import { reactive, readonly, type DeepReadonly } from 'vue';
import { t } from '@/i18n';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  tone?: 'danger' | 'primary';
}

interface ConfirmState extends Required<Omit<ConfirmOptions, never>> {
  open: boolean;
}

const state = reactive<ConfirmState>({
  open: false,
  title: '',
  message: '',
  confirmLabel: '',
  tone: 'primary',
});

let resolver: ((value: boolean) => void) | null = null;

/** Promise-based confirmation shared across the app (one ConfirmDialog host renders `state`). */
export function useConfirm() {
  function confirm(options: ConfirmOptions): Promise<boolean> {
    state.title = options.title;
    state.message = options.message;
    state.confirmLabel = options.confirmLabel ?? t('common.confirm');
    state.tone = options.tone ?? 'primary';
    state.open = true;
    return new Promise<boolean>((resolve) => {
      resolver = resolve;
    });
  }

  function settle(value: boolean): void {
    state.open = false;
    resolver?.(value);
    resolver = null;
  }

  return {
    state: readonly(state) as DeepReadonly<ConfirmState>,
    confirm,
    settle,
  };
}
