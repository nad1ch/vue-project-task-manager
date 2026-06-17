<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { RouteNames } from '@/router/routeNames';
</script>

<template>
  <section class="page">
    <h1 class="page__title">Page not found</h1>
    <p class="page__hint">The page you are looking for does not exist.</p>
    <RouterLink class="page__link" :to="{ name: RouteNames.Projects }">Back to projects</RouterLink>
  </section>
</template>

<style scoped lang="scss">
.page {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-5);

  &__title {
    font-size: var(--text-2xl);
    font-weight: var(--weight-semibold);
    color: var(--text-strong);
  }

  &__hint {
    color: var(--text-muted);
    font-size: var(--text-sm);
  }

  &__link {
    color: var(--accent);
    font-size: var(--text-sm);
    width: fit-content;
  }
}
</style>
