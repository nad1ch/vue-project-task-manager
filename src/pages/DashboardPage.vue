<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useProjectsStore } from '@/stores/useProjectsStore';
import { useTasksStore } from '@/stores/useTasksStore';
import { useDashboardStats } from '@/composables/useDashboardStats';
import { formatDate, isOverdue } from '@/lib/date';
import { RouteNames } from '@/router/routeNames';
import PageHeader from '@/components/layout/PageHeader.vue';
import StatCard from '@/components/dashboard/StatCard.vue';
import StatusChart from '@/components/dashboard/StatusChart.vue';
import AppIcon from '@/components/ui/AppIcon.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import TableSkeleton from '@/components/ui/TableSkeleton.vue';

const projectsStore = useProjectsStore();
const tasksStore = useTasksStore();
const { loaded: projectsLoaded } = storeToRefs(projectsStore);

const stats = useDashboardStats();

onMounted(() => {
  void projectsStore.load();
  void tasksStore.loadAll();
});

const isReady = computed(() => projectsLoaded.value);
const isEmpty = computed(() => projectsLoaded.value && stats.totalProjects.value === 0);
</script>

<template>
  <section class="dashboard">
    <PageHeader title="Overview" subtitle="Your projects and tasks at a glance" />

    <TableSkeleton v-if="!isReady" :rows="3" :columns="4" />

    <EmptyState
      v-else-if="isEmpty"
      icon="dashboard"
      title="Nothing to show yet"
      description="Create your first project to start seeing statistics here."
    >
      <template #actions>
        <RouterLink :to="{ name: RouteNames.Projects }">
          <BaseButton variant="primary">Go to projects</BaseButton>
        </RouterLink>
      </template>
    </EmptyState>

    <template v-else>
      <div class="dashboard__kpis">
        <StatCard label="Projects" icon="projects" tone="info" :value="stats.totalProjects.value" :hint="`${stats.activeProjects.value} active`" />
        <StatCard label="Open tasks" icon="list" tone="neutral" :value="stats.openTasks.value" :hint="`${stats.totalTasks.value} total`" />
        <StatCard label="Completed" icon="check-circle" tone="success" :value="stats.completedTasks.value" :hint="`${stats.completionRate.value}% completion`" />
        <StatCard label="Overdue" icon="alert" tone="danger" :value="stats.overdueTasks.value" hint="not done, past due" />
      </div>

      <div class="dashboard__split">
        <section class="panel panel--chart">
          <header class="panel__head">
            <h2 class="panel__title">Tasks by status</h2>
            <span class="panel__sub">{{ stats.totalTasks.value }} tasks</span>
          </header>
          <StatusChart :counts="stats.tasksByStatus.value" />
        </section>

        <div class="dashboard__column">
          <section class="panel">
            <header class="panel__head">
              <h2 class="panel__title">Upcoming deadlines</h2>
            </header>
            <ul v-if="stats.upcomingDeadlines.value.length > 0" class="deadlines">
              <li v-for="entry in stats.upcomingDeadlines.value" :key="entry.task.id" class="deadlines__item">
                <span class="deadlines__icon"><AppIcon name="clock" :size="15" /></span>
                <span class="deadlines__text">
                  <RouterLink
                    class="deadlines__title"
                    :to="{ name: RouteNames.ProjectDetails, params: { id: entry.task.projectId } }"
                  >
                    {{ entry.task.title }}
                  </RouterLink>
                  <span class="deadlines__project">{{ entry.projectName }}</span>
                </span>
                <span
                  class="deadlines__due tabular"
                  :class="{ 'deadlines__due--overdue': isOverdue(entry.task.dueDate, entry.task.status) }"
                >
                  {{ formatDate(entry.task.dueDate) }}
                </span>
              </li>
            </ul>
            <p v-else class="panel__empty">No open tasks with deadlines.</p>
          </section>

          <section class="panel">
            <header class="panel__head">
              <h2 class="panel__title">Needs attention</h2>
            </header>
            <ul v-if="stats.projectsNeedingAttention.value.length > 0" class="attention">
              <li v-for="entry in stats.projectsNeedingAttention.value" :key="entry.project.id" class="attention__item">
                <RouterLink
                  class="attention__name"
                  :to="{ name: RouteNames.ProjectDetails, params: { id: entry.project.id } }"
                >
                  {{ entry.project.name }}
                </RouterLink>
                <span class="attention__badge">{{ entry.overdue }} overdue</span>
              </li>
            </ul>
            <p v-else class="panel__empty">Nothing overdue — you're on track.</p>
          </section>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped lang="scss">
.dashboard {
  padding: var(--space-6);
  max-width: var(--content-max);
  margin: 0 auto;

  &__kpis {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: var(--space-4);
    margin-bottom: var(--space-5);
  }
  &__split {
    display: grid;
    grid-template-columns: 1.35fr 1fr;
    gap: var(--space-4);
    align-items: start;
  }
  &__column {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }
}
.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);

  &__head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: var(--space-4);
  }
  &__title {
    font-size: var(--text-md);
    font-weight: var(--weight-semibold);
    color: var(--text-strong);
  }
  &__sub {
    font-size: var(--text-xs);
    color: var(--text-muted);
  }
  &__empty {
    color: var(--text-muted);
    font-size: var(--text-sm);
  }
}
.deadlines {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);

  &__item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-2);
    border-radius: var(--radius-sm);
    &:hover {
      background: var(--surface-hover);
    }
  }
  &__icon {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    border-radius: var(--radius-sm);
    background: var(--surface-subtle);
    color: var(--text-muted);
  }
  &__text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }
  &__title {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    color: var(--text-strong);
    text-decoration: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    &:hover {
      color: var(--accent);
    }
  }
  &__project {
    font-size: var(--text-xs);
    color: var(--text-faint);
  }
  &__due {
    font-size: var(--text-xs);
    color: var(--text-muted);
    white-space: nowrap;
    &--overdue {
      color: var(--danger);
      font-weight: var(--weight-medium);
    }
  }
}
.attention {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
  }
  &__name {
    color: var(--text-strong);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    text-decoration: none;
    &:hover {
      color: var(--accent);
    }
  }
  &__badge {
    font-size: var(--text-xs);
    color: var(--danger);
    background: var(--danger-soft);
    padding: 2px 8px;
    border-radius: var(--radius-pill);
  }
}

@media (max-width: 920px) {
  .dashboard {
    padding: var(--space-5);
  }
  .dashboard__split {
    grid-template-columns: 1fr;
  }
}
</style>
