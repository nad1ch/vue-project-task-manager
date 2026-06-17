<script setup lang="ts">
import { formatDate, isOverdue } from '@/lib/date';
import type { Task } from '@/types';
import AppIcon from '@/components/ui/AppIcon.vue';

defineProps<{ task: Task }>();
defineEmits<{ edit: []; delete: [] }>();
</script>

<template>
  <article class="kcard" @click="$emit('edit')">
    <div class="kcard__top">
      <span class="mono kcard__id">#{{ task.id }}</span>
      <div class="kcard__actions">
        <button type="button" aria-label="Edit task" @click.stop="$emit('edit')"><AppIcon name="pencil" :size="14" /></button>
        <button type="button" aria-label="Delete task" @click.stop="$emit('delete')"><AppIcon name="trash" :size="14" /></button>
      </div>
    </div>
    <p class="kcard__title">{{ task.title }}</p>
    <div class="kcard__meta">
      <span class="kcard__assignee" :class="{ 'kcard__assignee--none': !task.assignee }">
        {{ task.assignee ?? 'Unassigned' }}
      </span>
      <span class="kcard__due" :class="{ 'kcard__due--overdue': isOverdue(task.dueDate, task.status) }">
        {{ formatDate(task.dueDate) }}
      </span>
    </div>
  </article>
</template>

<style scoped lang="scss">
.kcard {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  box-shadow: var(--shadow-xs);
  cursor: pointer;
  transition:
    box-shadow var(--dur-fast),
    border-color var(--dur-fast),
    background var(--dur-fast);

  // No geometry-changing transform — avoids clipping at the top of a column on hover/drag.
  &:hover {
    background: var(--surface-hover);
    border-color: var(--border-strong);
    box-shadow: var(--shadow-sm);
  }

  &__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  &__id {
    font-size: var(--text-xs);
    color: var(--text-faint);
  }
  &__actions {
    display: inline-flex;
    gap: 2px;
    opacity: 0;
    transition: opacity var(--dur-fast);
    button {
      width: 24px;
      height: 24px;
      border-radius: var(--radius-xs);
      color: var(--text-faint);
      &:hover {
        background: var(--surface-hover);
        color: var(--text-strong);
      }
    }
  }
  &:hover &__actions {
    opacity: 1;
  }
  &__title {
    margin: var(--space-2) 0;
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--text-strong);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  &__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    font-size: var(--text-xs);
  }
  &__assignee {
    color: var(--text-muted);
    &--none {
      color: var(--text-faint);
    }
  }
  &__due {
    color: var(--text-muted);
    &--overdue {
      color: var(--danger);
      font-weight: var(--weight-medium);
    }
  }
}
</style>
