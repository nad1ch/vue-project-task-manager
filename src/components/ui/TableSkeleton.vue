<script setup lang="ts">
import { t } from '@/i18n';

withDefaults(defineProps<{ rows?: number; columns?: number }>(), { rows: 6, columns: 5 });
</script>

<template>
  <div class="skeleton" role="status" :aria-label="t('common.loading')" aria-busy="true">
    <div v-for="r in rows" :key="r" class="skeleton__row" aria-hidden="true">
      <span v-for="c in columns" :key="c" class="skeleton__cell" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);

  &__row {
    display: grid;
    grid-template-columns: 64px 2fr 1fr 1fr 1fr;
    gap: var(--space-4);
    align-items: center;
  }
  &__cell {
    height: 14px;
    border-radius: var(--radius-xs);
    background: linear-gradient(
      90deg,
      var(--skeleton-base) 25%,
      var(--surface-hover) 37%,
      var(--skeleton-base) 63%
    );
    background-size: 400% 100%;
    animation: skeleton-shine 1.4s ease infinite;
  }
}

@keyframes skeleton-shine {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton__cell {
    animation: none;
    background: var(--skeleton-base);
  }
}
</style>
