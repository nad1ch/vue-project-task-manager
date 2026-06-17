import { computed } from 'vue';
import { useProjectsStore } from '@/stores/useProjectsStore';
import { useTasksStore } from '@/stores/useTasksStore';
import { isOverdue } from '@/lib/date';
import { ProjectStatus, TaskStatus, type Project, type Task } from '@/types';

export function useDashboardStats() {
  const projectsStore = useProjectsStore();
  const tasksStore = useTasksStore();

  const totalProjects = computed(() => projectsStore.items.length);
  const activeProjects = computed(() => projectsStore.countByStatus[ProjectStatus.Active]);
  const totalTasks = computed(() => tasksStore.items.length);
  const tasksByStatus = computed(() => tasksStore.countByStatus);
  const completedTasks = computed(() => tasksByStatus.value[TaskStatus.Done]);
  const openTasks = computed(() => totalTasks.value - completedTasks.value);
  const overdueTasks = computed(
    () => tasksStore.items.filter((t) => isOverdue(t.dueDate, t.status)).length,
  );
  const completionRate = computed(() =>
    totalTasks.value === 0 ? 0 : Math.round((completedTasks.value / totalTasks.value) * 100),
  );

  /** Projects with at least one overdue task, most-overdue first. */
  const projectsNeedingAttention = computed<Array<{ project: Project; overdue: number }>>(() => {
    return projectsStore.items
      .map((project) => ({
        project,
        overdue: tasksStore.items.filter(
          (t) => t.projectId === project.id && isOverdue(t.dueDate, t.status),
        ).length,
      }))
      .filter((entry) => entry.overdue > 0)
      .sort((a, b) => b.overdue - a.overdue);
  });

  /** Soonest-due open tasks (not done), with their project name. */
  const upcomingDeadlines = computed<Array<{ task: Task; projectName: string }>>(() => {
    return tasksStore.items
      .filter((t) => t.status !== TaskStatus.Done)
      .slice()
      .sort((a, b) => Date.parse(a.dueDate) - Date.parse(b.dueDate))
      .slice(0, 5)
      .map((task) => ({
        task,
        projectName: projectsStore.projectById(task.projectId)?.name ?? 'Unknown project',
      }));
  });

  return {
    totalProjects,
    activeProjects,
    totalTasks,
    tasksByStatus,
    completedTasks,
    openTasks,
    overdueTasks,
    completionRate,
    projectsNeedingAttention,
    upcomingDeadlines,
  };
}
