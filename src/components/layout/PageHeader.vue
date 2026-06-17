<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>();
</script>

<template>
  <header class="page-header">
    <div class="page-header__text">
      <h1 class="page-header__title">{{ title }}</h1>
      <p v-if="subtitle" class="page-header__subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="page-header__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped lang="scss">
.page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-5);

  &__title {
    font-size: var(--text-2xl);
    letter-spacing: -0.01em;
  }
  &__subtitle {
    margin-top: 2px;
    font-size: var(--text-sm);
    color: var(--text-muted);
  }
  &__actions {
    display: flex;
    gap: var(--space-2);
  }
}
</style>
