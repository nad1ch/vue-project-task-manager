<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { RouteNames } from '@/router/routeNames';
import { useUiPrefsStore } from '@/stores/useUiPrefsStore';
import { useConfirm } from '@/composables/useConfirm';
import { useDemoData } from '@/composables/useDemoData';
import IconButton from '@/components/ui/IconButton.vue';
import AppIcon, { type IconName } from '@/components/ui/AppIcon.vue';
import ToastHost from '@/components/feedback/ToastHost.vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';

const uiPrefs = useUiPrefsStore();
const { confirm } = useConfirm();
const { reset } = useDemoData();

const navItems: ReadonlyArray<{ name: string; label: string; icon: IconName }> = [
  { name: RouteNames.Projects, label: 'Projects', icon: 'projects' },
  { name: RouteNames.Dashboard, label: 'Dashboard', icon: 'dashboard' },
];

async function onReset(): Promise<void> {
  const ok = await confirm({
    title: 'Reset demo data',
    message: 'Restore the original seeded projects and tasks? Any changes you made will be discarded.',
    confirmLabel: 'Reset data',
    tone: 'danger',
  });
  if (ok) await reset();
}
</script>

<template>
  <div class="shell">
    <aside class="shell__sidebar">
      <div class="shell__brand">
        <span class="shell__brand-mark">A</span>
        <span class="shell__brand-text">
          <span class="shell__brand-name">Atlas</span>
          <span class="shell__brand-sub">Project workspace</span>
        </span>
      </div>

      <nav class="shell__nav" aria-label="Primary">
        <span class="shell__nav-label">Menu</span>
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          class="shell__nav-item"
          :to="{ name: item.name }"
        >
          <AppIcon :name="item.icon" :size="18" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="shell__sidebar-foot">
        <p class="shell__hint">Local demo — data is stored in your browser via a mock API.</p>
      </div>
    </aside>

    <header class="shell__topbar">
      <div class="shell__topbar-left">
        <nav class="shell__mobile-nav" aria-label="Primary mobile">
          <RouterLink
            v-for="item in navItems"
            :key="item.name"
            class="shell__mobile-link"
            :to="{ name: item.name }"
            :aria-label="item.label"
          >
            <AppIcon :name="item.icon" :size="18" />
          </RouterLink>
        </nav>
        <span class="shell__title">Project &amp; Task Manager</span>
      </div>

      <div class="shell__utils">
        <button type="button" class="shell__reset" @click="onReset">
          <AppIcon name="reset" :size="15" />
          <span class="shell__reset-text">Reset demo</span>
        </button>
        <IconButton
          :label="uiPrefs.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
          @click="uiPrefs.toggleTheme()"
        >
          <AppIcon :name="uiPrefs.theme === 'dark' ? 'sun' : 'moon'" :size="17" />
        </IconButton>
      </div>
    </header>

    <main class="shell__content">
      <RouterView />
    </main>

    <ToastHost />
    <ConfirmDialog />
  </div>
</template>

<style scoped lang="scss">
.shell {
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
    gap: var(--space-5);
    padding: var(--space-4) var(--space-3);
    background: var(--surface);
    border-right: 1px solid var(--border);
  }
  &__brand {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-1) var(--space-2);
  }
  &__brand-mark {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: var(--radius-md);
    background: var(--brand-gradient);
    color: #fff;
    font-size: var(--text-md);
    font-weight: var(--weight-bold);
    box-shadow: var(--shadow-sm);
  }
  &__brand-text {
    display: flex;
    flex-direction: column;
    line-height: 1.15;
  }
  &__brand-name {
    font-size: var(--text-md);
    font-weight: var(--weight-semibold);
    color: var(--text-strong);
  }
  &__brand-sub {
    font-size: var(--text-2xs);
    color: var(--text-faint);
  }
  &__nav {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  &__nav-label {
    padding: 0 var(--space-2) var(--space-2);
    font-size: var(--text-2xs);
    font-weight: var(--weight-semibold);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-faint);
  }
  &__nav-item {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    color: var(--text-muted);
    text-decoration: none;
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    transition:
      background var(--dur-fast),
      color var(--dur-fast);
    &:hover {
      background: var(--surface-hover);
      color: var(--text-strong);
    }
    &.router-link-active {
      background: var(--accent-soft);
      color: var(--accent);
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 18px;
        border-radius: var(--radius-pill);
        background: var(--accent);
      }
    }
    &:focus-visible {
      @include focus-ring;
    }
  }
  &__sidebar-foot {
    margin-top: auto;
  }
  &__hint {
    padding: var(--space-3);
    border-radius: var(--radius-md);
    background: var(--surface-subtle);
    border: 1px solid var(--border-subtle);
    font-size: var(--text-2xs);
    line-height: var(--leading-normal);
    color: var(--text-muted);
  }

  &__topbar {
    grid-area: topbar;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--space-5);
    background: color-mix(in srgb, var(--surface) 80%, transparent);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--border);
  }
  &__topbar-left {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
  &__mobile-nav {
    display: none;
    gap: 2px;
  }
  &__mobile-link {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: var(--radius-sm);
    color: var(--text-muted);
    &.router-link-active {
      background: var(--accent-soft);
      color: var(--accent);
    }
  }
  &__title {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--text-muted);
  }
  &__utils {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }
  &__reset {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    height: 34px;
    padding: 0 var(--space-3);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-strong);
    background: var(--surface);
    color: var(--text-muted);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    transition:
      background var(--dur-fast),
      color var(--dur-fast);
    &:hover {
      background: var(--surface-hover);
      color: var(--text-strong);
    }
    &:focus-visible {
      @include focus-ring;
    }
  }
  &__content {
    grid-area: content;
    overflow: auto;
  }
}

@media (max-width: 768px) {
  .shell {
    grid-template-columns: 1fr;
    grid-template-areas:
      'topbar'
      'content';
  }
  .shell__sidebar {
    display: none;
  }
  .shell__mobile-nav {
    display: flex;
  }
  .shell__reset-text {
    display: none;
  }
}
</style>
