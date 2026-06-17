import { createI18n } from 'vue-i18n';
import type { AppLocale } from '@/types';
import { messages } from './messages';

export const SUPPORTED_LOCALES: readonly AppLocale[] = ['en', 'uk'];

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
});

const globalI18n = i18n.global;
// Loose signature so dynamic keys (e.g. `taskStatus.${status}`) and store usage compile cleanly.
const rawT = globalI18n.t as unknown as (key: string, named?: Record<string, unknown>) => string;

/** Reactive translate usable in component templates and in stores/services. */
export function t(key: string, named?: Record<string, unknown>): string {
  // Force a read of the reactive locale so component render effects re-run on switch.
  void globalI18n.locale.value;
  return named === undefined ? rawT(key) : rawT(key, named);
}

export function setLocale(locale: AppLocale): void {
  globalI18n.locale.value = locale;
}

export function currentLocale(): AppLocale {
  return globalI18n.locale.value as AppLocale;
}
