<script setup lang="ts">
import { onMounted, watchEffect } from 'vue';
import AppLayout from '@/components/layout/AppLayout.vue';
import { useUiPrefsStore } from '@/stores/useUiPrefsStore';

const uiPrefs = useUiPrefsStore();

// Apply the persisted theme to the document root.
watchEffect(() => {
  document.documentElement.dataset.theme = uiPrefs.theme;
});

onMounted(() => {
  document.documentElement.dataset.theme = uiPrefs.theme;
});
</script>

<template>
  <AppLayout />
</template>
