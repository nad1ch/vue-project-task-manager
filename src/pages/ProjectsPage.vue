<template>
  <section class="page">
    <h1 class="page__title">Projects</h1>
    <p class="page__hint">
      Project table (id, name, tasks count, status, created), sorting, filtering, resizable
      columns and CRUD will live here.
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
