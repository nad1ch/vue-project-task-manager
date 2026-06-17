<script setup lang="ts">
import BaseModal from './BaseModal.vue';
import BaseButton from './BaseButton.vue';
import { useConfirm } from '@/composables/useConfirm';

const { state, settle } = useConfirm();
</script>

<template>
  <BaseModal :open="state.open" :title="state.title" size="sm" @close="settle(false)">
    <p class="confirm__message">{{ state.message }}</p>
    <template #footer>
      <BaseButton variant="ghost" @click="settle(false)">Cancel</BaseButton>
      <BaseButton :variant="state.tone === 'danger' ? 'danger' : 'primary'" @click="settle(true)">
        {{ state.confirmLabel }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped lang="scss">
.confirm__message {
  color: var(--text);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
}
</style>
