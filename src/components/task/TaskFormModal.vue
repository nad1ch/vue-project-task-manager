<script setup lang="ts">
import BaseModal from '@/components/ui/BaseModal.vue';
import TaskForm, { type TaskFormValues } from './TaskForm.vue';
import { t } from '@/i18n';
import type { TaskStatus } from '@/types';

defineProps<{
  open: boolean;
  mode: 'create' | 'edit';
  submitting: boolean;
  initial?: { title: string; status: TaskStatus; dueDate: string; assignee: string | null };
}>();
const emit = defineEmits<{ submit: [TaskFormValues]; close: [] }>();
</script>

<template>
  <BaseModal :open="open" :title="mode === 'create' ? t('taskForm.newTitle') : t('taskForm.editTitle')" @close="emit('close')">
    <TaskForm
      :mode="mode"
      :submitting="submitting"
      :initial="initial"
      @submit="emit('submit', $event)"
      @cancel="emit('close')"
    />
  </BaseModal>
</template>
