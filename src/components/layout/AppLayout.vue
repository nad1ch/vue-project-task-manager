<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { RouteNames } from '@/router/routeNames';
import { useUiPrefsStore } from '@/stores/useUiPrefsStore';
import IconButton from '@/components/ui/IconButton.vue';
import ToastHost from '@/components/feedback/ToastHost.vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';

const uiPrefs = useUiPrefsStore();
</script>

<template>
  <div class="app-shell">
    <aside class="app-shell__sidebar">
      <div class="app-shell__brand">
        <span class="app-shell__brand-mark">A</span>
        <span>Atlas</span>
      </div>
      <nav class="app-shell__nav">
        <RouterLink class="app-shell__nav-item" :to="{ name: RouteNames.Projects }">Projects</RouterLink>
        <RouterLink class="app-shell__nav-item" :to="{ name: RouteNames.Dashboard }">Dashboard</RouterLink>
      </nav>
    </aside>

    <header class="app-shell__topbar">
      <span class="app-shell__title">Project &amp; Task Manager</span>
      <IconButton
        :label="uiPrefs.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
        @click="uiPrefs.toggleTheme()"
      >
        {{ uiPrefs.theme === 'dark' ? '☀' : '☾' }}
      </IconButton>
    </header>

    <main class="app-shell__content">
      <RouterView />
    </main>

    <ToastHost />
    <ConfirmDialog />
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
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-lg);
    font-weight: var(--weight-semibold);
    color: var(--text-strong);
  }
  &__brand-mark {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
    background: var(--accent);
    color: var(--accent-contrast);
    font-size: var(--text-sm);
    font-weight: var(--weight-bold);
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
    justify-content: space-between;
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

@media (max-width: 768px) {
  .app-shell {
    grid-template-columns: 1fr;
    grid-template-areas:
      'topbar'
      'content';
  }
  .app-shell__sidebar {
    display: none;
  }
}
</style>
