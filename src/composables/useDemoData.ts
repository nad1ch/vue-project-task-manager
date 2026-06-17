import { db } from '@/mock';
import { t } from '@/i18n';
import { useProjectsStore } from '@/stores/useProjectsStore';
import { useTasksStore } from '@/stores/useTasksStore';
import { useToastStore } from '@/stores/useToastStore';

/** Demo utilities: reset the mock dataset back to its seeded state. */
export function useDemoData() {
  async function reset(): Promise<void> {
    db.reset();
    const projects = useProjectsStore();
    const tasks = useTasksStore();
    await Promise.all([projects.load(true), tasks.loadAll(true)]);
    useToastStore().success(t('toast.demoReset'));
  }

  return { reset };
}
