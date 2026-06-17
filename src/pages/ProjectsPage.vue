<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useProjectsStore } from '@/stores/useProjectsStore';
import { useTasksStore } from '@/stores/useTasksStore';
import { useUiPrefsStore } from '@/stores/useUiPrefsStore';
import { useTableSort } from '@/composables/useTableSort';
import { useDebounceFn } from '@/composables/useDebounceFn';
import { useConfirm } from '@/composables/useConfirm';
import { compareDates, compareNumbers, compareStrings, type Comparator } from '@/lib/compare';
import { useDates } from '@/composables/useDates';
import { DEBOUNCE_MS, PROJECT_STATUS_META } from '@/constants';
import { RouteNames } from '@/router/routeNames';
import { t } from '@/i18n';
import { localizeApiError } from '@/stores/localizeApiError';
import {
  ProjectStatus,
  type CreateProjectDto,
  type Project,
  type ProjectColumnKey,
  type TableColumn,
} from '@/types';
import PageHeader from '@/components/layout/PageHeader.vue';
import DataTable from '@/components/table/DataTable.vue';
import TableToolbar from '@/components/table/TableToolbar.vue';
import ProjectFormModal from '@/components/project/ProjectFormModal.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import StatusBadge from '@/components/ui/StatusBadge.vue';
import IconButton from '@/components/ui/IconButton.vue';
import AppIcon from '@/components/ui/AppIcon.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import ErrorState from '@/components/ui/ErrorState.vue';
import TableSkeleton from '@/components/ui/TableSkeleton.vue';

const router = useRouter();
const projectsStore = useProjectsStore();
const tasksStore = useTasksStore();
const uiPrefs = useUiPrefsStore();
const { confirm } = useConfirm();

const { items, loaded, isLoading, hasError, error } = storeToRefs(projectsStore);
const counts = computed(() => tasksStore.countByProjectId);
const { formatDate } = useDates();

onMounted(() => {
  void projectsStore.load();
  void tasksStore.loadAll();
});

const columns = computed<TableColumn<ProjectColumnKey>[]>(() => [
  { key: 'id', label: t('projects.colId'), sortable: true },
  { key: 'name', label: t('projects.colName'), sortable: true },
  { key: 'tasksCount', label: t('projects.colTasks'), sortable: true, align: 'right' },
  { key: 'status', label: t('projects.colStatus'), sortable: true },
  { key: 'createdAt', label: t('projects.colCreated'), sortable: true },
]);

const comparators: Record<ProjectColumnKey, Comparator<Project>> = {
  id: (a, b) => compareNumbers(a.id, b.id),
  name: (a, b) => compareStrings(a.name, b.name),
  tasksCount: (a, b) => compareNumbers(counts.value[a.id] ?? 0, counts.value[b.id] ?? 0),
  status: (a, b) => compareStrings(a.status, b.status),
  createdAt: (a, b) => compareDates(a.createdAt, b.createdAt),
};

const filtered = computed<Project[]>(() => {
  const f = uiPrefs.projectFilters;
  const search = f.search.trim().toLowerCase();
  return items.value.filter(
    (p) =>
      (search === '' || p.name.toLowerCase().includes(search)) &&
      (f.status === 'all' || p.status === f.status),
  );
});

const { sortedRows, ariaSort } = useTableSort<Project, ProjectColumnKey>(
  () => filtered.value,
  () => uiPrefs.projectSort,
  comparators,
);

// --- filters ---
const searchText = ref(uiPrefs.projectFilters.search);
const applySearch = useDebounceFn((value: string) => uiPrefs.setProjectFilters({ search: value }), DEBOUNCE_MS);
watch(searchText, (value) => applySearch(value));

function onClearFilters(): void {
  // Reset the visible input as well as the store, so no stale search text remains.
  searchText.value = '';
  uiPrefs.clearProjectFilters();
}

const statusFilter = computed({
  get: () => uiPrefs.projectFilters.status,
  set: (value: string) => uiPrefs.setProjectFilters({ status: value as ProjectStatus | 'all' }),
});
const statusFilterOptions = computed(() => [
  { value: 'all', label: t('common.allStatuses') },
  { value: ProjectStatus.Active, label: t('projectStatus.active') },
  { value: ProjectStatus.Archived, label: t('projectStatus.archived') },
]);

// --- modal / CRUD ---
const modalOpen = ref(false);
const modalMode = ref<'create' | 'edit'>('create');
const editing = ref<Project | null>(null);
const submitting = ref(false);

const modalInitial = computed(() =>
  editing.value
    ? {
        name: editing.value.name,
        description: editing.value.description,
        status: editing.value.status,
      }
    : undefined,
);

function openCreate(): void {
  modalMode.value = 'create';
  editing.value = null;
  modalOpen.value = true;
}
function openEdit(project: Project): void {
  modalMode.value = 'edit';
  editing.value = project;
  modalOpen.value = true;
}

async function onSubmit(dto: CreateProjectDto): Promise<void> {
  submitting.value = true;
  const current = editing.value;
  const result =
    modalMode.value === 'edit' && current
      ? await projectsStore.update(current.id, dto)
      : await projectsStore.create(dto);
  submitting.value = false;
  if (result) modalOpen.value = false;
}

async function onDelete(project: Project): Promise<void> {
  const confirmed = await confirm({
    title: t('projects.deleteTitle'),
    message: t('projects.deleteMessage', { name: project.name }),
    confirmLabel: t('projects.deleteConfirm'),
    tone: 'danger',
  });
  if (confirmed) await projectsStore.remove(project.id);
}

function goToProject(project: Project): void {
  void router.push({ name: RouteNames.ProjectDetails, params: { id: project.id } });
}

// Boundary adapters: DataTable speaks string keys; we keep ProjectColumnKey strict here.
function ariaSortFor(key: string) {
  return ariaSort(key as ProjectColumnKey);
}
function onToggleSort(key: string): void {
  uiPrefs.toggleProjectSort(key as ProjectColumnKey);
}
function onResize(key: string, width: number): void {
  uiPrefs.setProjectColumnWidth(key as ProjectColumnKey, width);
}

const showSkeleton = computed(() => isLoading.value && !loaded.value);
const showError = computed(() => hasError.value && items.value.length === 0);
const showEmpty = computed(() => loaded.value && items.value.length === 0);
const showNoMatch = computed(() => items.value.length > 0 && filtered.value.length === 0);
</script>

<template>
  <section class="projects">
    <PageHeader :title="t('projects.title')" :subtitle="t('projects.subtitle', { count: items.length })">
      <template #actions>
        <BaseButton variant="primary" @click="openCreate"><AppIcon name="plus" :size="16" />{{ t('projects.new') }}</BaseButton>
      </template>
    </PageHeader>

    <div class="card">
      <TableToolbar :summary="t('projects.resultCount', { count: filtered.length, total: items.length })">
        <template #filters>
          <div class="filter filter--search">
            <BaseInput id="project-search" v-model="searchText" :label="t('common.search')" :placeholder="t('projects.searchPlaceholder')" />
          </div>
          <div class="filter">
            <BaseSelect id="project-status-filter" v-model="statusFilter" :label="t('common.status')" :options="statusFilterOptions" />
          </div>
        </template>
      </TableToolbar>

      <TableSkeleton v-if="showSkeleton" :columns="5" />
      <ErrorState
        v-else-if="showError"
        :title="t('common.somethingWrong')"
        :message="error ? localizeApiError(error) : undefined"
        @retry="projectsStore.load(true)"
      />
      <EmptyState
        v-else-if="showEmpty"
        icon="projects"
        :title="t('projects.emptyTitle')"
        :description="t('projects.emptyDesc')"
      >
        <template #actions>
          <BaseButton variant="primary" @click="openCreate"><AppIcon name="plus" :size="16" />{{ t('projects.new') }}</BaseButton>
        </template>
      </EmptyState>
      <EmptyState
        v-else-if="showNoMatch"
        icon="search"
        :title="t('projects.noMatchTitle')"
        :description="t('projects.noMatchDesc')"
      >
        <template #actions>
          <BaseButton variant="secondary" @click="onClearFilters">{{ t('common.clearFilters') }}</BaseButton>
        </template>
      </EmptyState>

      <DataTable
        v-else
        :columns="columns"
        :widths="uiPrefs.projectColumnWidths"
        :get-aria-sort="ariaSortFor"
        has-actions
        @toggle-sort="onToggleSort"
        @resize="onResize"
      >
        <tbody>
          <tr
            v-for="project in sortedRows"
            :key="project.id"
            class="dt-row--clickable"
            @click="goToProject(project)"
          >
          <td><span class="mono muted">#{{ project.id }}</span></td>
          <td><span class="project-name">{{ project.name }}</span></td>
          <td class="dt-cell--right"><span class="tabular">{{ counts[project.id] ?? 0 }}</span></td>
          <td>
            <StatusBadge
              :label="t('projectStatus.' + project.status)"
              :tone="PROJECT_STATUS_META[project.status].tone"
            />
          </td>
          <td><span class="tabular muted">{{ formatDate(project.createdAt) }}</span></td>
          <td class="dt-cell--right" @click.stop>
            <div class="row-actions">
              <IconButton :label="t('projects.open')" @click="goToProject(project)"><AppIcon name="chevron-right" :size="16" /></IconButton>
              <IconButton :label="t('projects.edit')" @click="openEdit(project)"><AppIcon name="pencil" :size="16" /></IconButton>
              <IconButton :label="t('projects.remove')" danger @click="onDelete(project)"><AppIcon name="trash" :size="16" /></IconButton>
            </div>
          </td>
          </tr>
        </tbody>
      </DataTable>
    </div>

    <ProjectFormModal
      :open="modalOpen"
      :mode="modalMode"
      :submitting="submitting"
      :initial="modalInitial"
      @submit="onSubmit"
      @close="modalOpen = false"
    />
  </section>
</template>

<style scoped lang="scss">
.projects {
  padding: var(--space-6);
  max-width: var(--content-max);
  margin: 0 auto;
}
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.filter {
  width: 200px;
  &--search {
    width: 260px;
  }
}
.project-name {
  font-weight: var(--weight-medium);
  color: var(--text-strong);
  transition: color var(--dur-fast);
}
tr:hover .project-name {
  color: var(--accent);
}
.muted {
  color: var(--text-muted);
}
.row-actions {
  display: inline-flex;
  gap: 2px;
}
</style>
