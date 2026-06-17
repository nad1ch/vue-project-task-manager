<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';
import { VueDraggable } from 'vue-draggable-plus';
import { useProjectsStore } from '@/stores/useProjectsStore';
import { useTasksStore } from '@/stores/useTasksStore';
import { useUiPrefsStore } from '@/stores/useUiPrefsStore';
import { useToastStore } from '@/stores/useToastStore';
import { useTableSort } from '@/composables/useTableSort';
import { useConfirm } from '@/composables/useConfirm';
import { compareDates, compareNumbers, compareStrings, type Comparator } from '@/lib/compare';
import { countStatusBefore, neighbourStatus } from '@/lib/reorder';
import { ASSIGNEES, PROJECT_STATUS_META } from '@/constants';
import { RouteNames } from '@/router/routeNames';
import { t } from '@/i18n';
import { localizeApiError } from '@/stores/localizeApiError';
import {
  TaskStatus,
  ViewMode,
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
import TaskTableRow from '@/components/task/TaskTableRow.vue';
import KanbanBoard from '@/components/kanban/KanbanBoard.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import StatusBadge from '@/components/ui/StatusBadge.vue';
import AppIcon from '@/components/ui/AppIcon.vue';
import ViewModeToggle from '@/components/ui/ViewModeToggle.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import ErrorState from '@/components/ui/ErrorState.vue';
import TableSkeleton from '@/components/ui/TableSkeleton.vue';

interface DragEventLike {
  oldIndex?: number;
  newIndex?: number;
}

const route = useRoute();
const projectsStore = useProjectsStore();
const tasksStore = useTasksStore();
const uiPrefs = useUiPrefsStore();
const toastStore = useToastStore();
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

const columns = computed<TableColumn<TaskColumnKey>[]>(() => [
  { key: 'id', label: t('details.colId'), sortable: true },
  { key: 'title', label: t('details.colTitle'), sortable: true },
  { key: 'assignee', label: t('details.colAssignee'), sortable: true },
  { key: 'status', label: t('details.colStatus'), sortable: true },
  { key: 'dueDate', label: t('details.colDue'), sortable: true },
]);

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

// --- view mode + DnD gating ---
const viewMode = computed({
  get: () => uiPrefs.viewMode,
  set: (mode) => uiPrefs.setViewMode(mode),
});
const canDragTable = computed(() => uiPrefs.taskSort === null && !uiPrefs.isTaskFilterActive);
const kanbanDndEnabled = computed(() => !uiPrefs.isTaskFilterActive);

// Manual-mode table order: grouped by status, then by lane order.
function sortedManual(): Task[] {
  return [...projectTasks.value].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.order - b.order,
  );
}
const manualList = ref<Task[]>([]);
watchEffect(() => {
  manualList.value = sortedManual();
});

function onTableReorder(event: DragEventLike): void {
  const flat = manualList.value;
  const index = event.newIndex ?? 0;
  const moved = flat[index];
  if (!moved) return;
  const target = (neighbourStatus(flat, index) ?? moved.status) as TaskStatusType;
  if (target !== moved.status) {
    // Table DnD reorders within a status only; status changes belong to the Kanban.
    manualList.value = sortedManual();
    toastStore.warning(t('toast.useKanban'));
    return;
  }
  const lane = tasksStore.laneOf(projectId.value, target);
  const fromIndex = lane.findIndex((t) => t.id === moved.id);
  const toIndex = countStatusBefore(flat, index, target);
  void tasksStore.reorderWithinLane(projectId.value, target, fromIndex, toIndex);
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
const assigneeFilterOptions = computed(() => [
  { value: 'all', label: t('details.allAssignees') },
  { value: UNASSIGNED, label: t('details.unassigned') },
  ...ASSIGNEES.map((name) => ({ value: name, label: name })),
]);
const statusFilterOptions = computed(() => [
  { value: 'all', label: t('common.allStatuses') },
  ...Object.values(TaskStatus).map((s) => ({ value: s, label: t('taskStatus.' + s) })),
]);

// --- CRUD ---
const modalOpen = ref(false);
const modalMode = ref<'create' | 'edit'>('create');
const editing = ref<Task | null>(null);
const createStatus = ref<TaskStatusType>(TaskStatus.Todo);
const submitting = ref(false);

const modalInitial = computed(() => {
  if (editing.value) {
    return {
      title: editing.value.title,
      status: editing.value.status,
      dueDate: editing.value.dueDate,
      assignee: editing.value.assignee,
    };
  }
  return { title: '', status: createStatus.value, dueDate: '', assignee: null };
});

function openCreate(status: TaskStatusType = TaskStatus.Todo): void {
  modalMode.value = 'create';
  editing.value = null;
  createStatus.value = status;
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
    title: t('details.deleteTitle'),
    message: t('details.deleteMessage', { name: task.title }),
    confirmLabel: t('details.deleteConfirm'),
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
const showContent = computed(
  () => !showSkeleton.value && !showError.value && !showEmpty.value && !showNoMatch.value,
);
</script>

<template>
  <section class="details">
    <RouterLink class="details__back" :to="{ name: RouteNames.Projects }">
      <AppIcon name="arrow-left" :size="15" />
      <span>{{ t('details.back') }}</span>
    </RouterLink>

    <div v-if="notFound">
      <EmptyState icon="alert" :title="t('details.notFoundTitle')" :description="t('details.notFoundDesc')">
        <template #actions>
          <RouterLink :to="{ name: RouteNames.Projects }">
            <BaseButton variant="primary">{{ t('details.backToProjects') }}</BaseButton>
          </RouterLink>
        </template>
      </EmptyState>
    </div>

    <template v-else-if="project">
      <PageHeader :title="project.name" :subtitle="project.description || t('details.noDescription')">
        <template #actions>
          <StatusBadge
            :label="t('projectStatus.' + project.status)"
            :tone="PROJECT_STATUS_META[project.status].tone"
          />
          <BaseButton variant="primary" @click="openCreate()"><AppIcon name="plus" :size="16" />{{ t('details.newTask') }}</BaseButton>
        </template>
      </PageHeader>

      <div class="card">
        <TableToolbar :summary="t('details.resultCount', { count: filteredTasks.length, total: projectTasks.length })">
          <template #filters>
            <div class="filter">
              <BaseSelect
                id="task-assignee-filter"
                v-model="assigneeFilter"
                :label="t('details.assignee')"
                :options="assigneeFilterOptions"
              />
            </div>
            <div class="filter">
              <BaseSelect
                id="task-status-filter"
                v-model="statusFilter"
                :label="t('common.status')"
                :options="statusFilterOptions"
              />
            </div>
          </template>
          <template #actions>
            <ViewModeToggle v-model="viewMode" />
          </template>
        </TableToolbar>

        <TableSkeleton v-if="showSkeleton" :columns="5" />
        <ErrorState
          v-else-if="showError"
          :title="t('common.somethingWrong')"
          :message="tasksError ? localizeApiError(tasksError) : undefined"
          @retry="tasksStore.loadAll(true)"
        />
        <EmptyState
          v-else-if="showEmpty"
          :title="t('details.emptyTitle')"
          :description="t('details.emptyDesc')"
        >
          <template #actions>
            <BaseButton variant="primary" @click="openCreate()"><AppIcon name="plus" :size="16" />{{ t('details.newTask') }}</BaseButton>
          </template>
        </EmptyState>
        <EmptyState
          v-else-if="showNoMatch"
          icon="search"
          :title="t('details.noMatchTitle')"
          :description="t('details.noMatchDesc')"
        >
          <template #actions>
            <BaseButton variant="secondary" @click="uiPrefs.clearTaskFilters()">{{ t('common.clearFilters') }}</BaseButton>
          </template>
        </EmptyState>

        <template v-else-if="showContent">
          <!-- TABLE VIEW -->
          <template v-if="viewMode === ViewMode.Table">
            <p v-if="!canDragTable" class="dnd-note">{{ t('details.dndDisabledSort') }}</p>
            <p v-else class="dnd-note">{{ t('details.dndManualHint') }}</p>
            <DataTable
              :columns="columns"
              :widths="uiPrefs.taskColumnWidths"
              :get-aria-sort="ariaSortFor"
              has-actions
              @toggle-sort="onToggleSort"
              @resize="onResize"
            >
              <VueDraggable
                v-if="canDragTable"
                v-model="manualList"
                tag="tbody"
                :animation="150"
                ghost-class="task-row-ghost"
                @update="onTableReorder"
              >
                <TaskTableRow
                  v-for="task in manualList"
                  :key="task.id"
                  :task="task"
                  draggable
                  @edit="openEdit(task)"
                  @delete="onDelete(task)"
                />
              </VueDraggable>
              <tbody v-else>
                <TaskTableRow
                  v-for="task in sortedRows"
                  :key="task.id"
                  :task="task"
                  @edit="openEdit(task)"
                  @delete="onDelete(task)"
                />
              </tbody>
            </DataTable>
          </template>

          <!-- KANBAN VIEW -->
          <div v-else class="kanban-wrap">
            <p v-if="!kanbanDndEnabled" class="dnd-note">{{ t('details.dndDisabledFilters') }}</p>
            <KanbanBoard
              :tasks="filteredTasks"
              :project-id="projectId"
              :dnd-enabled="kanbanDndEnabled"
              @edit="openEdit"
              @delete="onDelete"
              @create="openCreate"
            />
          </div>
        </template>
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
  padding: var(--space-6);
  max-width: var(--content-max);
  margin: 0 auto;

  &__back {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
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
  box-shadow: var(--shadow-sm);
}
.filter {
  width: 190px;
}
.dnd-note {
  padding: var(--space-2) var(--space-4);
  background: var(--surface-subtle);
  border-bottom: 1px solid var(--border);
  font-size: var(--text-xs);
  color: var(--text-muted);
}
.kanban-wrap {
  padding: var(--space-4);
}
:deep(.task-row-ghost) {
  opacity: 0.4;
}
</style>
