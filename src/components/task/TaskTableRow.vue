<script setup lang="ts">
import { isOverdue } from '@/lib/date';
import { TASK_STATUS_META } from '@/constants';
import { t } from '@/i18n';
import { useDates } from '@/composables/useDates';
import type { Task } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge.vue';
import IconButton from '@/components/ui/IconButton.vue';
import AppIcon from '@/components/ui/AppIcon.vue';

defineProps<{ task: Task; draggable?: boolean }>();
defineEmits<{ edit: []; delete: [] }>();

const { formatDate } = useDates();
</script>

<template>
  <tr class="dt-row--clickable" :class="{ 'task-row--draggable': draggable }" @click="$emit('edit')">
    <td><span class="mono muted">#{{ task.id }}</span></td>
    <td><span class="task-title">{{ task.title }}</span></td>
    <td>
      <span v-if="task.assignee">{{ task.assignee }}</span>
      <span v-else class="muted">{{ t('details.unassigned') }}</span>
    </td>
    <td>
      <StatusBadge :label="t('taskStatus.' + task.status)" :tone="TASK_STATUS_META[task.status].tone" />
    </td>
    <td>
      <span class="tabular" :class="{ overdue: isOverdue(task.dueDate, task.status) }">
        {{ formatDate(task.dueDate) }}
      </span>
    </td>
    <td class="dt-cell--right" @click.stop>
      <div class="row-actions">
        <IconButton :label="t('details.edit')" @click="$emit('edit')"><AppIcon name="pencil" :size="16" /></IconButton>
        <IconButton :label="t('details.remove')" danger @click="$emit('delete')"><AppIcon name="trash" :size="16" /></IconButton>
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
