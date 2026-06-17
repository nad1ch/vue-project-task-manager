<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useProjectsStore } from '@/stores/useProjectsStore';
import { useTasksStore } from '@/stores/useTasksStore';
import { useUiPrefsStore } from '@/stores/useUiPrefsStore';
import { useTableSort } from '@/composables/useTableSort';
import { useConfirm } from '@/composables/useConfirm';
import { compareDates, compareNumbers, compareStrings, type Comparator } from '@/lib/compare';
import { formatDate, isOverdue } from '@/lib/date';
import { ASSIGNEES, PROJECT_STATUS_META, TASK_STATUS_META } from '@/constants';
import { RouteNames } from '@/router/routeNames';
import {
  TaskStatus,
  type Task,
  type TaskColumnKey,
  type TaskStatus as TaskStatusType,
  type TableColumn,
} from '@/types';
import type { TaskFormValues } from '@/components/task/TaskForm.vue';
import PageHeader from '@/components/layout/PageHeader.vue';
import DataTable from '@/components/table/DataTable.vue';
import TableToolbar from '@/components/table/TableToolbar.vue';
import TaskFormModal from '@/components/task/TaskFormModal.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import StatusBadge from '@/components/ui/StatusBadge.vue';
import IconButton from '@/components/ui/IconButton.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import ErrorState from '@/components/ui/ErrorState.vue';
import TableSkeleton from '@/components/ui/TableSkeleton.vue';

const route = useRoute();
const projectsStore = useProjectsStore();
const tasksStore = useTasksStore();
const uiPrefs = useUiPrefsStore();
const { confirm } = useConfirm();

const { loaded: projectsLoaded } = storeToRefs(projectsStore);
const { isLoading: tasksLoading, loaded: tasksLoaded, hasError: tasksHasError, error: tasksError } =
  storeToRefs(tasksStore);

const projectId = computed(() => Number(route.params.id));
const project = computed(() => projectsStore.projectById(projectId.value));
const notFound = computed(() => projectsLoaded.value && project.value === undefined);

onMounted(() => {
  void projectsStore.load();
  void tasksStore.loadAll();
});

const STATUS_ORDER: Record<TaskStatusType, number> = {
  [TaskStatus.Todo]: 0,
  [TaskStatus.InProgress]: 1,
  [TaskStatus.Done]: 2,
};
const UNASSIGNED = 'none';

const projectTasks = computed<Task[]>(() => tasksStore.tasksForProject(projectId.value));

const filteredTasks = computed<Task[]>(() => {
  const f = uiPrefs.taskFilters;
  return projectTasks.value.filter((t) => {
    const assigneeMatch =
      f.assignee === 'all' ||
      (f.assignee === UNASSIGNED ? t.assignee === null : t.assignee === f.assignee);
    const statusMatch = f.status === 'all' || t.status === f.status;
    return assigneeMatch && statusMatch;
  });
});

const columns: TableColumn<TaskColumnKey>[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'title', label: 'Title', sortable: true },
  { key: 'assignee', label: 'Assignee', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'dueDate', label: 'Due date', sortable: true },
];

const comparators: Record<TaskColumnKey, Comparator<Task>> = {
  id: (a, b) => compareNumbers(a.id, b.id),
  title: (a, b) => compareStrings(a.title, b.title),
  assignee: (a, b) => compareStrings(a.assignee ?? '', b.assignee ?? ''),
  status: (a, b) => compareNumbers(STATUS_ORDER[a.status], STATUS_ORDER[b.status]),
  dueDate: (a, b) => compareDates(a.dueDate, b.dueDate),
};

const { sortedRows, ariaSort } = useTableSort<Task, TaskColumnKey>(
  () => filteredTasks.value,
  () => uiPrefs.taskSort,
  comparators,
);

function ariaSortFor(key: string) {
  return ariaSort(key as TaskColumnKey);
}
function onToggleSort(key: string): void {
  uiPrefs.toggleTaskSort(key as TaskColumnKey);
}
function onResize(key: string, width: number): void {
  uiPrefs.setTaskColumnWidth(key as TaskColumnKey, width);
}

// --- filters ---
const assigneeFilter = computed({
  get: () => uiPrefs.taskFilters.assignee,
  set: (value: string) => uiPrefs.setTaskFilters({ assignee: value }),
});
const statusFilter = computed({
  get: () => uiPrefs.taskFilters.status,
  set: (value: string) => uiPrefs.setTaskFilters({ status: value as TaskStatusType | 'all' }),
});
const assigneeFilterOptions = [
  { value: 'all', label: 'All assignees' },
  { value: UNASSIGNED, label: 'Unassigned' },
  ...ASSIGNEES.map((name) => ({ value: name, label: name })),
];
const statusFilterOptions = [
  { value: 'all', label: 'All statuses' },
  ...Object.values(TaskStatus).map((s) => ({ value: s, label: TASK_STATUS_META[s].label })),
];

// --- CRUD ---
const modalOpen = ref(false);
const modalMode = ref<'create' | 'edit'>('create');
const editing = ref<Task | null>(null);
const submitting = ref(false);

const modalInitial = computed(() =>
  editing.value
    ? {
        title: editing.value.title,
        status: editing.value.status,
        dueDate: editing.value.dueDate,
        assignee: editing.value.assignee,
      }
    : undefined,
);

function openCreate(): void {
  modalMode.value = 'create';
  editing.value = null;
  modalOpen.value = true;
}
function openEdit(task: Task): void {
  modalMode.value = 'edit';
  editing.value = task;
  modalOpen.value = true;
}

async function onSubmit(values: TaskFormValues): Promise<void> {
  submitting.value = true;
  const current = editing.value;
  const result =
    modalMode.value === 'edit' && current
      ? await tasksStore.update(current.id, values)
      : await tasksStore.create({ projectId: projectId.value, ...values });
  submitting.value = false;
  if (result) modalOpen.value = false;
}

async function onDelete(task: Task): Promise<void> {
  const confirmed = await confirm({
    title: 'Delete task',
    message: `Delete "${task.title}"? This cannot be undone.`,
    confirmLabel: 'Delete',
    tone: 'danger',
  });
  if (confirmed) await tasksStore.remove(task.id);
}

const showSkeleton = computed(() => tasksLoading.value && !tasksLoaded.value);
const showError = computed(() => tasksHasError.value && projectTasks.value.length === 0);
const showEmpty = computed(() => tasksLoaded.value && projectTasks.value.length === 0);
const showNoMatch = computed(
  () => projectTasks.value.length > 0 && filteredTasks.value.length === 0,
);
</script>

<template>
  <section class="details">
    <RouterLink class="details__back" :to="{ name: RouteNames.Projects }">← Projects</RouterLink>

    <div v-if="notFound" class="details__notfound">
      <EmptyState title="Project not found" description="This project may have been deleted.">
        <template #actions>
          <RouterLink :to="{ name: RouteNames.Projects }">
            <BaseButton variant="primary">Back to projects</BaseButton>
          </RouterLink>
        </template>
      </EmptyState>
    </div>

    <template v-else-if="project">
      <PageHeader :title="project.name" :subtitle="project.description || 'No description'">
        <template #actions>
          <StatusBadge
            :label="PROJECT_STATUS_META[project.status].label"
            :tone="PROJECT_STATUS_META[project.status].tone"
          />
          <BaseButton variant="primary" @click="openCreate">+ New task</BaseButton>
        </template>
      </PageHeader>

      <div class="card">
        <TableToolbar :count="filteredTasks.length" :total="projectTasks.length" noun="tasks">
          <template #filters>
            <div class="filter">
              <BaseSelect
                id="task-assignee-filter"
                v-model="assigneeFilter"
                label="Assignee"
                :options="assigneeFilterOptions"
              />
            </div>
            <div class="filter">
              <BaseSelect
                id="task-status-filter"
                v-model="statusFilter"
                label="Status"
                :options="statusFilterOptions"
              />
            </div>
          </template>
        </TableToolbar>

        <TableSkeleton v-if="showSkeleton" :columns="5" />
        <ErrorState v-else-if="showError" :message="tasksError?.message" @retry="tasksStore.loadAll(true)" />
        <EmptyState
          v-else-if="showEmpty"
          title="No tasks yet"
          description="Add the first task for this project."
        >
          <template #actions>
            <BaseButton variant="primary" @click="openCreate">+ New task</BaseButton>
          </template>
        </EmptyState>
        <EmptyState
          v-else-if="showNoMatch"
          title="No tasks match your filters"
          description="Try a different assignee or status."
        >
          <template #actions>
            <BaseButton variant="secondary" @click="uiPrefs.clearTaskFilters()">Clear filters</BaseButton>
          </template>
        </EmptyState>

        <DataTable
          v-else
          :columns="columns"
          :widths="uiPrefs.taskColumnWidths"
          :get-aria-sort="ariaSortFor"
          has-actions
          @toggle-sort="onToggleSort"
          @resize="onResize"
        >
          <tr
            v-for="task in sortedRows"
            :key="task.id"
            class="dt-row--clickable"
            @click="openEdit(task)"
          >
            <td><span class="mono muted">#{{ task.id }}</span></td>
            <td><span class="task-title">{{ task.title }}</span></td>
            <td>
              <span v-if="task.assignee">{{ task.assignee }}</span>
              <span v-else class="muted">Unassigned</span>
            </td>
            <td>
              <StatusBadge
                :label="TASK_STATUS_META[task.status].label"
                :tone="TASK_STATUS_META[task.status].tone"
              />
            </td>
            <td>
              <span class="tabular" :class="{ overdue: isOverdue(task.dueDate, task.status) }">
                {{ formatDate(task.dueDate) }}
              </span>
            </td>
            <td class="dt-cell--right" @click.stop>
              <div class="row-actions">
                <IconButton label="Edit task" @click="openEdit(task)">✎</IconButton>
                <IconButton label="Delete task" danger @click="onDelete(task)">🗑</IconButton>
              </div>
            </td>
          </tr>
        </DataTable>
      </div>
    </template>

    <TableSkeleton v-else :columns="5" />

    <TaskFormModal
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
.details {
  padding: var(--space-5);
  max-width: 1100px;
  margin: 0 auto;

  &__back {
    display: inline-block;
    margin-bottom: var(--space-3);
    font-size: var(--text-sm);
    color: var(--text-muted);
    text-decoration: none;
    &:hover {
      color: var(--accent);
    }
  }
}
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.filter {
  width: 200px;
}
.task-title {
  font-weight: var(--weight-medium);
  color: var(--text-strong);
}
.muted {
  color: var(--text-muted);
}
.overdue {
  color: var(--danger);
  font-weight: var(--weight-medium);
}
.row-actions {
  display: inline-flex;
  gap: 2px;
}
</style>
