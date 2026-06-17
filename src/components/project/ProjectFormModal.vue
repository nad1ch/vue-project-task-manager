<script setup lang="ts">
import BaseModal from '@/components/ui/BaseModal.vue';
import ProjectForm from './ProjectForm.vue';
import { t } from '@/i18n';
import type { CreateProjectDto, ProjectStatus } from '@/types';

defineProps<{
  open: boolean;
  mode: 'create' | 'edit';
  submitting: boolean;
  initial?: { name: string; description?: string; status: ProjectStatus };
}>();
const emit = defineEmits<{ submit: [CreateProjectDto]; close: [] }>();
</script>

<template>
  <BaseModal
    :open="open"
    :title="mode === 'create' ? t('projectForm.newTitle') : t('projectForm.editTitle')"
    @close="emit('close')"
  >
    <ProjectForm
      :mode="mode"
      :submitting="submitting"
      :initial="initial"
      @submit="emit('submit', $event)"
      @cancel="emit('close')"
    />
  </BaseModal>
</template>
