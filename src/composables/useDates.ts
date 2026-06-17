import { i18n } from '@/i18n';
import { formatDate as rawFormatDate } from '@/lib/date';

/** Date formatting bound to the current locale (reactive in templates). */
export function useDates() {
  function formatDate(value: string): string {
    const tag = i18n.global.locale.value === 'uk' ? 'uk-UA' : 'en-GB';
    return rawFormatDate(value, tag);
  }
  return { formatDate };
}
