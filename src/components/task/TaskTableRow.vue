<script setup lang="ts">
import { formatDate, isOverdue } from '@/lib/date';
import { TASK_STATUS_META } from '@/constants';
import type { Task } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge.vue';
import IconButton from '@/components/ui/IconButton.vue';
import AppIcon from '@/components/ui/AppIcon.vue';

defineProps<{ task: Task; draggable?: boolean }>();
defineEmits<{ edit: []; delete: [] }>();
</script>

<template>
  <tr class="dt-row--clickable" :class="{ 'task-row--draggable': draggable }" @click="$emit('edit')">
    <td><span class="mono muted">#{{ task.id }}</span></td>
    <td><span class="task-title">{{ task.title }}</span></td>
    <td>
      <span v-if="task.assignee">{{ task.assignee }}</span>
      <span v-else class="muted">Unassigned</span>
    </td>
    <td>
      <StatusBadge :label="TASK_STATUS_META[task.status].label" :tone="TASK_STATUS_META[task.status].tone" />
    </td>
    <td>
      <span class="tabular" :class="{ overdue: isOverdue(task.dueDate, task.status) }">
        {{ formatDate(task.dueDate) }}
      </span>
    </td>
    <td class="dt-cell--right" @click.stop>
      <div class="row-actions">
        <IconButton label="Edit task" @click="$emit('edit')"><AppIcon name="pencil" :size="16" /></IconButton>
        <IconButton label="Delete task" danger @click="$emit('delete')"><AppIcon name="trash" :size="16" /></IconButton>
      </div>
    </td>
  </tr>
</template>

<style scoped lang="scss">
.task-row--draggable {
  cursor: grab;
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
