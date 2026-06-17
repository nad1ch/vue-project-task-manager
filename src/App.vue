<script setup lang="ts">
import { onMounted, watch, watchEffect } from 'vue';
import AppLayout from '@/components/layout/AppLayout.vue';
import { useUiPrefsStore } from '@/stores/useUiPrefsStore';
import { setLocale } from '@/i18n';

const uiPrefs = useUiPrefsStore();

// Apply the persisted theme to the document root.
watchEffect(() => {
  document.documentElement.dataset.theme = uiPrefs.theme;
});

// Keep the active i18n locale in sync with the persisted preference (no reload).
watch(
  () => uiPrefs.locale,
  (value) => setLocale(value),
  { immediate: true },
);

onMounted(() => {
  document.documentElement.dataset.theme = uiPrefs.theme;
});
</script>

<template>
  <AppLayout />
</template>
