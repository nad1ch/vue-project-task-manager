<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useProjectsStore } from '@/stores/useProjectsStore';
import { useTasksStore } from '@/stores/useTasksStore';
import { useDashboardStats } from '@/composables/useDashboardStats';
import { RouteNames } from '@/router/routeNames';
import PageHeader from '@/components/layout/PageHeader.vue';
import StatCard from '@/components/dashboard/StatCard.vue';
import StatusChart from '@/components/dashboard/StatusChart.vue';
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
      title="Nothing to show yet"
      description="Create a project to start seeing statistics here."
    >
      <template #actions>
        <RouterLink :to="{ name: RouteNames.Projects }" class="dashboard__link">Go to projects →</RouterLink>
      </template>
    </EmptyState>

    <template v-else>
      <div class="dashboard__kpis">
        <StatCard
          label="Projects"
          :value="stats.totalProjects.value"
          tone="info"
          :hint="`${stats.activeProjects.value} active`"
        >
          <template #icon>▤</template>
        </StatCard>
        <StatCard
          label="Open tasks"
          :value="stats.openTasks.value"
          tone="neutral"
          :hint="`${stats.totalTasks.value} total`"
        >
          <template #icon>◔</template>
        </StatCard>
        <StatCard
          label="Completed"
          :value="stats.completedTasks.value"
          tone="success"
          :hint="`${stats.completionRate.value}% completion`"
        >
          <template #icon>✓</template>
        </StatCard>
        <StatCard label="Overdue" :value="stats.overdueTasks.value" tone="danger" hint="not done, past due">
          <template #icon>!</template>
        </StatCard>
      </div>

      <div class="dashboard__split">
        <div class="panel">
          <h2 class="panel__title">Tasks by status</h2>
          <StatusChart :counts="stats.tasksByStatus.value" />
        </div>

        <div class="panel">
          <h2 class="panel__title">Needs attention</h2>
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
          <p v-else class="panel__empty">Nothing overdue — you're on track. 🎉</p>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped lang="scss">
.dashboard {
  padding: var(--space-5);
  max-width: 1100px;
  margin: 0 auto;

  &__kpis {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
    margin-bottom: var(--space-5);
  }
  &__split {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: var(--space-4);
  }
  &__link {
    color: var(--accent);
    font-size: var(--text-sm);
  }
}
.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);

  &__title {
    font-size: var(--text-md);
    margin-bottom: var(--space-3);
  }
  &__empty {
    color: var(--text-muted);
    font-size: var(--text-sm);
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

@media (max-width: 860px) {
  .dashboard__split {
    grid-template-columns: 1fr;
  }
}
</style>
