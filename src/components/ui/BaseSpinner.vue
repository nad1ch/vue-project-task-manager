<script setup lang="ts">
withDefaults(defineProps<{ size?: number; label?: string }>(), { size: 18, label: 'Loading' });
</script>

<template>
  <span
    class="spinner"
    role="status"
    :aria-label="label"
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
