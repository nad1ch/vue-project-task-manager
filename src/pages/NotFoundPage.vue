<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { RouteNames } from '@/router/routeNames';
import { t } from '@/i18n';
import AppIcon from '@/components/ui/AppIcon.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
</script>

<template>
  <section class="nf">
    <div class="nf__card">
      <span class="nf__icon" aria-hidden="true"><AppIcon name="search" :size="22" /></span>
      <p class="nf__code" aria-hidden="true">404</p>
      <h1 class="nf__title">{{ t('notFound.title') }}</h1>
      <p class="nf__text">{{ t('notFound.hint') }}</p>
      <RouterLink class="nf__cta" :to="{ name: RouteNames.Projects }">
        <BaseButton variant="primary">
          <AppIcon name="arrow-left" :size="16" />{{ t('details.backToProjects') }}
        </BaseButton>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped lang="scss">
.nf {
  display: grid;
  place-items: center;
  min-height: 70vh;
  padding: var(--space-6);

  &__card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-2);
    max-width: 440px;
    padding: var(--space-7) var(--space-6);
    background: var(--surface-raised);
    border: 1px solid var(--border);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
    animation: nf-in var(--dur-slow) var(--ease-standard) both;
  }
  &__icon {
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    border-radius: var(--radius-lg);
    background: var(--accent-soft);
    color: var(--accent);
  }
  &__code {
    margin-top: var(--space-2);
    font-size: var(--text-3xl);
    font-weight: var(--weight-bold);
    letter-spacing: 0.04em;
    background: var(--brand-gradient);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    line-height: 1;
  }
  &__title {
    font-size: var(--text-lg);
    color: var(--text-strong);
  }
  &__text {
    color: var(--text-muted);
    font-size: var(--text-sm);
    line-height: var(--leading-normal);
  }
  &__cta {
    margin-top: var(--space-3);
    text-decoration: none;
  }
}

@keyframes nf-in {
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
  .nf__card {
    animation: none;
  }
}
</style>
