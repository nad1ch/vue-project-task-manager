import { defineStore } from 'pinia';
import { computed } from 'vue';
import {
  DEFAULT_PROJECT_COLUMN_WIDTHS,
  DEFAULT_TASK_COLUMN_WIDTHS,
  DEFAULT_UI_PREFERENCES,
  STORAGE_KEYS,
  UI_PREFS_LAYOUT_VERSION,
} from '@/constants';
import { usePersistedRef } from '@/composables/usePersistedRef';
import {
  SortDirection,
  type AppLocale,
  type ProjectColumnKey,
  type ProjectFilters,
  type SortDescriptor,
  type TaskColumnKey,
  type TaskFilters,
  type ThemeMode,
  type UiPreferences,
  type ViewMode,
} from '@/types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Parse persisted prefs and run a one-time layout migration: when the stored
 * layout version is missing or old, adopt the new compact table column widths
 * while preserving theme, locale, filters, sorting and view mode. Corrupt or
 * non-object input falls back to defaults.
 */
function migratePrefs(raw: unknown): UiPreferences {
  if (!isRecord(raw)) return { ...DEFAULT_UI_PREFERENCES };
  const stored = raw as Partial<UiPreferences>;
  const merged: UiPreferences = { ...DEFAULT_UI_PREFERENCES, ...stored };
  if (stored.layoutVersion !== UI_PREFS_LAYOUT_VERSION) {
    merged.projectColumnWidths = { ...DEFAULT_PROJECT_COLUMN_WIDTHS };
    merged.taskColumnWidths = { ...DEFAULT_TASK_COLUMN_WIDTHS };
    merged.layoutVersion = UI_PREFS_LAYOUT_VERSION;
  }
  return merged;
}

/** True when localStorage holds prefs from an older (or missing) layout version. */
function storedLayoutIsStale(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.uiPrefs);
    if (raw === null) return false;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return false;
    return parsed.layoutVersion !== UI_PREFS_LAYOUT_VERSION;
  } catch {
    return false;
  }
}

function nextSort<K extends string>(
  current: SortDescriptor<K> | null,
  key: K,
): SortDescriptor<K> | null {
  if (!current || current.key !== key) return { key, direction: SortDirection.Asc };
  if (current.direction === SortDirection.Asc) return { key, direction: SortDirection.Desc };
  return null;
}

export const useUiPrefsStore = defineStore('ui-prefs', () => {
  const prefs = usePersistedRef<UiPreferences>(STORAGE_KEYS.uiPrefs, DEFAULT_UI_PREFERENCES, {
    parse: migratePrefs,
  });

  // Persist the migrated shape exactly once, so the one-time layout migration is
  // not re-applied on every load. Re-assigning triggers the persisted (sync) write.
  if (storedLayoutIsStale()) {
    prefs.value = { ...prefs.value };
  }

  const viewMode = computed(() => prefs.value.viewMode);
  const theme = computed(() => prefs.value.theme);
  const locale = computed(() => prefs.value.locale);
  const projectSort = computed(() => prefs.value.projectSort);
  const taskSort = computed(() => prefs.value.taskSort);
  const projectFilters = computed(() => prefs.value.projectFilters);
  const taskFilters = computed(() => prefs.value.taskFilters);
  const projectColumnWidths = computed(() => prefs.value.projectColumnWidths);
  const taskColumnWidths = computed(() => prefs.value.taskColumnWidths);

  const isProjectFilterActive = computed(
    () => prefs.value.projectFilters.search.trim() !== '' || prefs.value.projectFilters.status !== 'all',
  );
  const isTaskFilterActive = computed(
    () => prefs.value.taskFilters.assignee !== 'all' || prefs.value.taskFilters.status !== 'all',
  );

  function patch(partial: Partial<UiPreferences>): void {
    prefs.value = { ...prefs.value, ...partial };
  }

  function setViewMode(mode: ViewMode): void {
    patch({ viewMode: mode });
  }
  function setTheme(value: ThemeMode): void {
    patch({ theme: value });
  }
  function toggleTheme(): void {
    patch({ theme: prefs.value.theme === 'light' ? 'dark' : 'light' });
  }
  function setLocale(value: AppLocale): void {
    patch({ locale: value });
  }
  function setProjectSort(value: SortDescriptor<ProjectColumnKey> | null): void {
    patch({ projectSort: value });
  }
  function toggleProjectSort(key: ProjectColumnKey): void {
    patch({ projectSort: nextSort(prefs.value.projectSort, key) });
  }
  function setTaskSort(value: SortDescriptor<TaskColumnKey> | null): void {
    patch({ taskSort: value });
  }
  function toggleTaskSort(key: TaskColumnKey): void {
    patch({ taskSort: nextSort(prefs.value.taskSort, key) });
  }
  function setProjectFilters(partial: Partial<ProjectFilters>): void {
    patch({ projectFilters: { ...prefs.value.projectFilters, ...partial } });
  }
  function setTaskFilters(partial: Partial<TaskFilters>): void {
    patch({ taskFilters: { ...prefs.value.taskFilters, ...partial } });
  }
  function clearProjectFilters(): void {
    patch({ projectFilters: { search: '', status: 'all' } });
  }
  function clearTaskFilters(): void {
    patch({ taskFilters: { assignee: 'all', status: 'all' } });
  }
  function setProjectColumnWidth(key: ProjectColumnKey, width: number): void {
    patch({ projectColumnWidths: { ...prefs.value.projectColumnWidths, [key]: width } });
  }
  function setTaskColumnWidth(key: TaskColumnKey, width: number): void {
    patch({ taskColumnWidths: { ...prefs.value.taskColumnWidths, [key]: width } });
  }

  return {
    prefs,
    viewMode,
    theme,
    locale,
    projectSort,
    taskSort,
    projectFilters,
    taskFilters,
    projectColumnWidths,
    taskColumnWidths,
    isProjectFilterActive,
    isTaskFilterActive,
    setViewMode,
    setTheme,
    toggleTheme,
    setLocale,
    setProjectSort,
    toggleProjectSort,
    setTaskSort,
    toggleTaskSort,
    setProjectFilters,
    setTaskFilters,
    clearProjectFilters,
    clearTaskFilters,
    setProjectColumnWidth,
    setTaskColumnWidth,
  };
});
