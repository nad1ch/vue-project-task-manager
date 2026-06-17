<script setup lang="ts">
import { computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { TaskStatus, type TaskStatus as TaskStatusType } from '@/types';
import { TASK_STATUS_META } from '@/constants';
import { useUiPrefsStore } from '@/stores/useUiPrefsStore';

ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps<{ counts: Record<TaskStatusType, number> }>();
const uiPrefs = useUiPrefsStore();

function cssVar(name: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value === '' ? '#888888' : value;
}

const total = computed(
  () =>
    props.counts[TaskStatus.Todo] + props.counts[TaskStatus.InProgress] + props.counts[TaskStatus.Done],
);

const chartData = computed<ChartData<'doughnut'>>(() => {
  // Reference theme so colours recompute on light/dark switch.
  void uiPrefs.theme;
  return {
    labels: [
      TASK_STATUS_META[TaskStatus.Todo].label,
      TASK_STATUS_META[TaskStatus.InProgress].label,
      TASK_STATUS_META[TaskStatus.Done].label,
    ],
    datasets: [
      {
        data: [
          props.counts[TaskStatus.Todo],
          props.counts[TaskStatus.InProgress],
          props.counts[TaskStatus.Done],
        ],
        backgroundColor: [cssVar('--text-faint'), cssVar('--info'), cssVar('--success')],
        borderColor: cssVar('--surface'),
        borderWidth: 2,
      },
    ],
  };
});

const options = computed<ChartOptions<'doughnut'>>(() => {
  void uiPrefs.theme;
  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: cssVar('--text-muted'), boxWidth: 10, boxHeight: 10, padding: 16 },
      },
      tooltip: {
        displayColors: false,
        padding: { top: 8, right: 12, bottom: 8, left: 12 },
        backgroundColor: cssVar('--surface-raised'),
        titleColor: cssVar('--text-strong'),
        bodyColor: cssVar('--text'),
        borderColor: cssVar('--border'),
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          title: () => '',
          label: (ctx) => `${ctx.label}: ${ctx.parsed}`,
        },
      },
    },
  };
});

const summary = computed(
  () =>
    `Tasks by status: ${props.counts[TaskStatus.Todo]} to do, ` +
    `${props.counts[TaskStatus.InProgress]} in progress, ${props.counts[TaskStatus.Done]} done.`,
);
</script>

<template>
  <div class="chart" role="img" :aria-label="summary">
    <Doughnut v-if="total > 0" :data="chartData" :options="options" />
    <p v-else class="chart__empty">No tasks to chart yet.</p>
    <p class="chart__sr">{{ summary }}</p>
  </div>
</template>

<style scoped lang="scss">
.chart {
  position: relative;
  height: 260px;

  &__empty {
    display: grid;
    place-items: center;
    height: 100%;
    color: var(--text-faint);
    font-size: var(--text-sm);
  }
  &__sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }
}
</style>
