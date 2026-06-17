<script setup lang="ts">
defineProps<{ title?: string; message?: string }>();
defineEmits<{ retry: [] }>();
</script>

<template>
  <div class="error-state" role="alert">
    <div class="error-state__icon" aria-hidden="true">!</div>
    <h3 class="error-state__title">{{ title ?? 'Something went wrong' }}</h3>
    <p v-if="message" class="error-state__msg">{{ message }}</p>
    <button type="button" class="error-state__retry" @click="$emit('retry')">Try again</button>
  </div>
</template>

<style scoped lang="scss">
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-2);
  padding: var(--space-7) var(--space-5);
  max-width: 380px;
  margin: 0 auto;

  &__icon {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--danger-soft);
    color: var(--danger);
    font-weight: var(--weight-bold);
  }
  &__title {
    font-size: var(--text-lg);
  }
  &__msg {
    color: var(--text-muted);
    font-size: var(--text-sm);
  }
  &__retry {
    margin-top: var(--space-2);
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-strong);
    background: var(--surface);
    color: var(--text-strong);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    &:hover {
      background: var(--surface-hover);
    }
    &:focus-visible {
      @include focus-ring;
    }
  }
}
</style>
