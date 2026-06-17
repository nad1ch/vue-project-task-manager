<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue';
import { useRouter } from 'vue-router';
import { RouteNames } from '@/router/routeNames';
import { db } from '@/mock';
import { t } from '@/i18n';
import AppIcon from '@/components/ui/AppIcon.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

const error = ref<unknown>(null);
const router = useRouter();

onErrorCaptured((err) => {
  error.value = err;
  // Keep the error visible to developers; never swallow it silently.
  console.error('[AppErrorBoundary] captured an unexpected component error:', err);
  return false; // stop propagation and render the fallback instead of a blank screen
});

function reload(): void {
  window.location.reload();
}
function goToProjects(): void {
  error.value = null;
  void router.push({ name: RouteNames.Projects });
}
function resetDemo(): void {
  // Recovery path for corrupted persisted data: restore clean seed, then reload.
  db.reset();
  window.location.reload();
}
</script>

<template>
  <div v-if="error" class="boundary" role="alert">
    <div class="boundary__card">
      <span class="boundary__icon" aria-hidden="true"><AppIcon name="alert" :size="24" /></span>
      <h2 class="boundary__title">{{ t('errorBoundary.title') }}</h2>
      <p class="boundary__text">{{ t('errorBoundary.text') }}</p>
      <div class="boundary__actions">
        <BaseButton variant="primary" @click="reload">{{ t('errorBoundary.reload') }}</BaseButton>
        <BaseButton variant="secondary" @click="goToProjects">{{ t('details.backToProjects') }}</BaseButton>
        <BaseButton variant="ghost" @click="resetDemo">{{ t('topbar.resetDemo') }}</BaseButton>
      </div>
    </div>
  </div>
  <slot v-else />
</template>

<style scoped lang="scss">
.boundary {
  display: grid;
  place-items: center;
  min-height: 60vh;
  padding: var(--space-6);

  &__card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-3);
    max-width: 460px;
    padding: var(--space-7) var(--space-6);
    background: var(--surface-raised);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
    animation: boundary-in var(--dur-slow) var(--ease-standard) both;
  }
  &__icon {
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    border-radius: var(--radius-lg);
    background: var(--danger-soft);
    color: var(--danger);
  }
  &__title {
    font-size: var(--text-xl);
    color: var(--text-strong);
  }
  &__text {
    color: var(--text-muted);
    font-size: var(--text-sm);
    line-height: var(--leading-normal);
  }
  &__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-2);
    margin-top: var(--space-2);
  }
}

@keyframes boundary-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .boundary__card {
    animation: none;
  }
}
</style>
