<script setup lang="ts">
import { computed, reactive, watchEffect } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { TaskStatus, type Task, type TaskStatus as TaskStatusType } from '@/types';
import { TASK_STATUS_META } from '@/constants';
import { t } from '@/i18n';
import { useTasksStore } from '@/stores/useTasksStore';
import KanbanColumn from './KanbanColumn.vue';
import KanbanCard from './KanbanCard.vue';

const dropLabel = computed(() => `"${t('kanban.dropHere')}"`);

interface DragEventLike {
  oldIndex?: number;
  newIndex?: number;
}

const props = defineProps<{ tasks: Task[]; projectId: number; dndEnabled: boolean }>();
const emit = defineEmits<{ edit: [Task]; delete: [Task]; create: [TaskStatusType] }>();

const tasksStore = useTasksStore();

const COLUMNS: readonly TaskStatusType[] = [TaskStatus.Todo, TaskStatus.InProgress, TaskStatus.Done];

const board = reactive<Record<TaskStatusType, Task[]>>({
  [TaskStatus.Todo]: [],
  [TaskStatus.InProgress]: [],
  [TaskStatus.Done]: [],
});

watchEffect(() => {
  for (const status of COLUMNS) {
    board[status] = props.tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.order - b.order);
  }
});

function onUpdate(status: TaskStatusType, event: DragEventLike): void {
  void tasksStore.reorderWithinLane(props.projectId, status, event.oldIndex ?? 0, event.newIndex ?? 0);
}

function onAdd(status: TaskStatusType, event: DragEventLike): void {
  const index = event.newIndex ?? 0;
  const task = board[status][index];
  if (task) void tasksStore.moveTask(task.id, status, index);
}
</script>

<template>
  <div class="kanban">
    <KanbanColumn
      v-for="status in COLUMNS"
      :key="status"
      :label="t('taskStatus.' + status)"
      :tone="TASK_STATUS_META[status].tone"
      :count="board[status].length"
      @add="emit('create', status)"
    >
      <VueDraggable
        v-model="board[status]"
        class="kanban__list"
        :style="{ '--drop-label': dropLabel }"
        :group="{ name: 'tasks' }"
        :animation="150"
        :disabled="!dndEnabled"
        ghost-class="kcard-ghost"
        chosen-class="kcard-chosen"
        @update="(e) => onUpdate(status, e)"
        @add="(e) => onAdd(status, e)"
      >
        <KanbanCard
          v-for="task in board[status]"
          :key="task.id"
          :task="task"
          @edit="emit('edit', task)"
          @delete="emit('delete', task)"
        />
      </VueDraggable>
    </KanbanColumn>
  </div>
</template>

<style scoped lang="scss">
.kanban {
  display: flex;
  gap: var(--space-4);
  // Internal horizontal scroll only; never expands the page width.
  overflow-x: auto;
  overscroll-behavior-x: contain;
  min-width: 0;
  max-width: 100%;
  padding-bottom: var(--space-3);
  align-items: flex-start;
  min-height: 360px;
}
.kanban__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-height: 80px;

  &:empty::after {
    content: var(--drop-label, 'Drop tasks here');
    display: grid;
    place-items: center;
    height: 72px;
    border: 1px dashed var(--border-dashed, var(--border-strong));
    border-radius: var(--radius-md);
    color: var(--text-faint);
    font-size: var(--text-xs);
  }
}
:deep(.kcard-ghost) {
  opacity: 0.4;
}
:deep(.kcard-chosen) {
  cursor: grabbing;
}
</style>
