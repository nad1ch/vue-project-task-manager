<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { RouteNames } from '@/router/routeNames';
</script>

<template>
  <div class="app-shell">
    <aside class="app-shell__sidebar">
      <div class="app-shell__brand">Atlas</div>
      <nav class="app-shell__nav">
        <RouterLink class="app-shell__nav-item" :to="{ name: RouteNames.Projects }">
          Projects
        </RouterLink>
        <RouterLink class="app-shell__nav-item" :to="{ name: RouteNames.Dashboard }">
          Dashboard
        </RouterLink>
      </nav>
    </aside>

    <header class="app-shell__topbar">
      <span class="app-shell__title">Project &amp; Task Manager</span>
    </header>

    <main class="app-shell__content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped lang="scss">
.app-shell {
  display: grid;
  grid-template-columns: var(--sidebar-w) 1fr;
  grid-template-rows: var(--topbar-h) 1fr;
  grid-template-areas:
    'sidebar topbar'
    'sidebar content';
  min-height: 100vh;
  background: var(--canvas);
  color: var(--text);

  &__sidebar {
    grid-area: sidebar;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-4);
    background: var(--surface);
    border-right: 1px solid var(--border);
  }

  &__brand {
    font-size: var(--text-lg);
    font-weight: var(--weight-semibold);
    color: var(--text-strong);
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  &__nav-item {
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-sm);
    color: var(--text-muted);
    text-decoration: none;
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);

    &:hover {
      background: var(--surface-hover);
      color: var(--text-strong);
    }

    &.router-link-active {
      background: var(--accent-soft);
      color: var(--accent);
    }
  }

  &__topbar {
    grid-area: topbar;
    display: flex;
    align-items: center;
    padding: 0 var(--space-5);
    background: var(--surface);
    border-bottom: 1px solid var(--border);
  }

  &__title {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--text-muted);
  }

  &__content {
    grid-area: content;
    overflow: auto;
  }
}
</style>
