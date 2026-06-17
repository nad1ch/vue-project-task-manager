<script setup lang="ts">
import { computed } from 'vue';
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { taskCreateSchema, taskEditSchema } from '@/lib/validation/taskSchema';
import { ASSIGNEES } from '@/constants';
import { TaskStatus, type TaskStatus as TaskStatusType } from '@/types';
import { toDateInputValue, todayInputValue } from '@/lib/date';
import { t } from '@/i18n';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseDatePicker from '@/components/ui/BaseDatePicker.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

export interface TaskFormValues {
  title: string;
  status: TaskStatusType;
  dueDate: string;
  assignee: string | null;
}

const props = defineProps<{
  mode: 'create' | 'edit';
  submitting: boolean;
  initial?: { title: string; status: TaskStatusType; dueDate: string; assignee: string | null };
}>();
const emit = defineEmits<{ submit: [TaskFormValues]; cancel: [] }>();

const statusOptions = computed(() => [
  { value: TaskStatus.Todo, label: t('taskStatus.todo') },
  { value: TaskStatus.InProgress, label: t('taskStatus.in_progress') },
  { value: TaskStatus.Done, label: t('taskStatus.done') },
]);
const assigneeOptions = computed(() => [
  { value: '', label: t('taskForm.unassigned') },
  ...ASSIGNEES.map((name) => ({ value: name, label: name })),
]);

const validationSchema = toTypedSchema(props.mode === 'create' ? taskCreateSchema : taskEditSchema);

const { handleSubmit } = useForm({
  validationSchema,
  initialValues: {
    title: props.initial?.title ?? '',
    status: props.initial?.status ?? TaskStatus.Todo,
    dueDate: props.initial?.dueDate ? toDateInputValue(props.initial.dueDate) : todayInputValue(),
    assignee: props.initial?.assignee ?? '',
  },
});

const { value: title, errorMessage: titleError, handleBlur: titleBlur } = useField<string>('title');
const { value: status } = useField<string>('status');
const { value: dueDate, errorMessage: dueDateError, handleBlur: dueDateBlur } = useField<string>('dueDate');
const { value: assignee } = useField<string>('assignee');

const minDate = props.mode === 'create' ? todayInputValue() : undefined;

const onSubmit = handleSubmit((values) => {
  emit('submit', {
    title: values.title.trim(),
    status: values.status,
    dueDate: values.dueDate,
    assignee: values.assignee ?? null,
  });
});
</script>

<template>
  <form class="form" novalidate @submit.prevent="onSubmit">
    <BaseInput
      id="task-title"
      v-model="title"
      :label="t('taskForm.title')"
      :placeholder="t('taskForm.titlePlaceholder')"
      required
      :error="titleError ? t(titleError) : undefined"
      @blur="titleBlur"
    />
    <div class="form__row">
      <BaseSelect id="task-status" v-model="status" :label="t('taskForm.status')" required :options="statusOptions" />
      <BaseDatePicker
        id="task-due"
        v-model="dueDate"
        :label="t('taskForm.due')"
        required
        :min-date="minDate"
        :error="dueDateError ? t(dueDateError) : undefined"
        @blur="dueDateBlur"
      />
    </div>
    <BaseSelect id="task-assignee" v-model="assignee" :label="t('taskForm.assignee')" :options="assigneeOptions" />

    <div class="form__actions">
      <BaseButton variant="ghost" type="button" @click="emit('cancel')">{{ t('common.cancel') }}</BaseButton>
      <BaseButton variant="primary" type="submit" :loading="submitting">
        {{ mode === 'create' ? t('taskForm.submitCreate') : t('taskForm.submitSave') }}
      </BaseButton>
    </div>
  </form>
</template>

<style scoped lang="scss">
.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);

  &__row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
  }
  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
    margin-top: var(--space-2);
  }
}

@media (max-width: 480px) {
  .form__row {
    grid-template-columns: 1fr;
  }
}
</style>
