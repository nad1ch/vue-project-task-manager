<script setup lang="ts">
defineProps<{ id: string }>();
</script>

<template>
  <section class="page">
    <h1 class="page__title">Project #{{ id }}</h1>
    <p class="page__hint">
      Project details, task table and Kanban (both backed by one tasks store) with task CRUD and
      drag &amp; drop will live here. The project is resolved from the projects store by id.
    </p>
  </section>
</template>

<style scoped lang="scss">
.page {
  padding: var(--space-5);

  &__title {
    font-size: var(--text-2xl);
    font-weight: var(--weight-semibold);
    color: var(--text-strong);
  }

  &__hint {
    margin-top: var(--space-2);
    color: var(--text-muted);
    font-size: var(--text-sm);
  }
}
</style>
