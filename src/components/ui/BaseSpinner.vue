<script setup lang="ts">
import { t } from '@/i18n';

const props = withDefaults(defineProps<{ size?: number; label?: string }>(), { size: 18 });
</script>

<template>
  <span
    class="spinner"
    role="status"
    :aria-label="props.label ?? t('common.loading')"
    :style="{ width: `${size}px`, height: `${size}px` }"
  />
</template>

<style scoped lang="scss">
.spinner {
  display: inline-block;
  border-radius: 50%;
  border: 2px solid var(--border-strong);
  border-top-color: var(--accent);
  animation: spinner-spin 0.6s linear infinite;
}
@keyframes spinner-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
