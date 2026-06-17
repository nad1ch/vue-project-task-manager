import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { ApiError, normalizeError } from '@/api';
import { projectService } from '@/services/projectService';
import { ProjectStatus, type CreateProjectDto, type Project, type UpdateProjectDto } from '@/types';
import { t } from '@/i18n';
import { useToastStore } from './useToastStore';
import { useTasksStore } from './useTasksStore';
import { localizeApiError } from './localizeApiError';

type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

export const useProjectsStore = defineStore('projects', () => {
  const items = ref<Project[]>([]);
  const status = ref<LoadStatus>('idle');
  const error = ref<ApiError | null>(null);
  const pendingIds = ref<Set<number>>(new Set());
  const loaded = ref(false);

  const isLoading = computed(() => status.value === 'loading');
  const hasError = computed(() => error.value !== null);

  const projectById = (id: number): Project | undefined => items.value.find((p) => p.id === id);

  const countByStatus = computed<Record<ProjectStatus, number>>(() => {
    const counts: Record<ProjectStatus, number> = {
      [ProjectStatus.Active]: 0,
      [ProjectStatus.Archived]: 0,
    };
    for (const p of items.value) counts[p.status] += 1;
    return counts;
  });

  function setPending(id: number, pending: boolean): void {
    const next = new Set(pendingIds.value);
    if (pending) next.add(id);
    else next.delete(id);
    pendingIds.value = next;
  }

  async function load(force = false): Promise<void> {
    if (loaded.value && !force) return;
    status.value = 'loading';
    error.value = null;
    try {
      items.value = await projectService.list();
      status.value = 'success';
      loaded.value = true;
    } catch (e) {
      const err = normalizeError(e);
      error.value = err;
      status.value = 'error';
      useToastStore().error(localizeApiError(err));
    }
  }

  async function create(dto: CreateProjectDto): Promise<Project | null> {
    try {
      const created = await projectService.create(dto);
      items.value = [created, ...items.value];
      useToastStore().success(t('toast.projectCreated'));
      return created;
    } catch (e) {
      useToastStore().error(localizeApiError(normalizeError(e)));
      return null;
    }
  }

  async function update(id: number, dto: UpdateProjectDto): Promise<Project | null> {
    const snapshot = projectById(id);
    if (snapshot) items.value = items.value.map((p) => (p.id === id ? { ...p, ...dto } : p));
    setPending(id, true);
    try {
      const updated = await projectService.update(id, dto);
      items.value = items.value.map((p) => (p.id === id ? updated : p));
      useToastStore().success(t('toast.projectUpdated'));
      return updated;
    } catch (e) {
      if (snapshot) items.value = items.value.map((p) => (p.id === id ? snapshot : p));
      useToastStore().error(localizeApiError(normalizeError(e)));
      return null;
    } finally {
      setPending(id, false);
    }
  }

  async function remove(id: number): Promise<boolean> {
    const snapshot = [...items.value];
    items.value = items.value.filter((p) => p.id !== id);
    try {
      await projectService.remove(id);
      useTasksStore().handleProjectRemoved(id);
      useToastStore().success(t('toast.projectDeleted'));
      return true;
    } catch (e) {
      items.value = snapshot;
      useToastStore().error(localizeApiError(normalizeError(e)));
      return false;
    }
  }

  return {
    items,
    status,
    error,
    pendingIds,
    loaded,
    isLoading,
    hasError,
    projectById,
    countByStatus,
    load,
    create,
    update,
    remove,
  };
});
