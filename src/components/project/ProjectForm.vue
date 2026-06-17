<script setup lang="ts">
import { computed } from 'vue';
import { useField, useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { projectSchema } from '@/lib/validation/projectSchema';
import { ProjectStatus, type CreateProjectDto } from '@/types';
import { t } from '@/i18n';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseTextarea from '@/components/ui/BaseTextarea.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

const props = defineProps<{
  mode: 'create' | 'edit';
  submitting: boolean;
  initial?: { name: string; description?: string; status: ProjectStatus };
}>();
const emit = defineEmits<{ submit: [CreateProjectDto]; cancel: [] }>();

const statusOptions = computed(() => [
  { value: ProjectStatus.Active, label: t('projectStatus.active') },
  { value: ProjectStatus.Archived, label: t('projectStatus.archived') },
]);

const { handleSubmit } = useForm({
  validationSchema: toTypedSchema(projectSchema),
  initialValues: {
    name: props.initial?.name ?? '',
    description: props.initial?.description ?? '',
    status: props.initial?.status ?? ProjectStatus.Active,
  },
});

const { value: name, errorMessage: nameError, handleBlur: nameBlur } = useField<string>('name');
const { value: description, errorMessage: descriptionError } = useField<string>('description');
// Bound as a string for the select; the schema narrows it back to ProjectStatus on submit.
const { value: status } = useField<string>('status');

const onSubmit = handleSubmit((values) => {
  const trimmed = (values.description ?? '').trim();
  emit('submit', {
    name: values.name.trim(),
    description: trimmed === '' ? undefined : trimmed,
    status: values.status,
  });
});
</script>

<template>
  <form class="form" novalidate @submit.prevent="onSubmit">
    <BaseInput
      id="project-name"
      v-model="name"
      :label="t('projectForm.name')"
      :placeholder="t('projectForm.namePlaceholder')"
      required
      :error="nameError ? t(nameError) : undefined"
      @blur="nameBlur"
    />
    <BaseTextarea
      id="project-description"
      v-model="description"
      :label="t('projectForm.description')"
      :placeholder="t('projectForm.descriptionPlaceholder')"
      :error="descriptionError ? t(descriptionError) : undefined"
    />
    <BaseSelect
      id="project-status"
      v-model="status"
      :label="t('projectForm.status')"
      required
      :options="statusOptions"
    />

    <div class="form__actions">
      <BaseButton variant="ghost" type="button" @click="emit('cancel')">{{ t('common.cancel') }}</BaseButton>
      <BaseButton variant="primary" type="submit" :loading="submitting">
        {{ mode === 'create' ? t('projectForm.submitCreate') : t('projectForm.submitSave') }}
      </BaseButton>
    </div>
  </form>
</template>

<style scoped lang="scss">
.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
    margin-top: var(--space-2);
  }
}
</style>
