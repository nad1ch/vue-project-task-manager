import { describe, expect, it } from 'vitest';
import { messages } from './messages';
import { setLocale, t } from './index';

function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'object' && value !== null
      ? flattenKeys(value as Record<string, unknown>, path)
      : [path];
  });
}

describe('i18n catalog', () => {
  it('en and uk expose identical key sets (no partial localization)', () => {
    const en = flattenKeys(messages.en).sort();
    const uk = flattenKeys(messages.uk).sort();
    expect(uk).toEqual(en);
  });

  it('translates and switches locale at runtime without reload', () => {
    setLocale('en');
    expect(t('projects.title')).toBe('Projects');
    expect(t('taskStatus.in_progress')).toBe('In Progress');
    setLocale('uk');
    expect(t('projects.title')).toBe('Проєкти');
    expect(t('taskStatus.in_progress')).toBe('У роботі');
    setLocale('en');
  });

  it('interpolates named params', () => {
    setLocale('en');
    expect(t('projects.subtitle', { count: 3 })).toContain('3');
    expect(t('details.resultCount', { count: 2, total: 5 })).toBe('2 of 5 tasks');
  });
});
