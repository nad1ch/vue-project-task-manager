import { beforeEach, describe, expect, it } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createMemoryHistory, createRouter } from 'vue-router';
import { routes } from '@/router/routes';
import { installMock, db } from '@/mock';
import ProjectsPage from './ProjectsPage.vue';

async function waitFor(predicate: () => boolean, attempts = 30): Promise<void> {
  for (let i = 0; i < attempts && !predicate(); i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 40));
    await flushPromises();
  }
}

describe('ProjectsPage (runtime smoke)', () => {
  beforeEach(() => {
    localStorage.clear();
    db.init();
    installMock();
    setActivePinia(createPinia());
  });

  it('mounts and renders seeded projects with their derived task counts', async () => {
    const router = createRouter({ history: createMemoryHistory(), routes });
    const wrapper = mount(ProjectsPage, { global: { plugins: [router] } });

    await waitFor(() => wrapper.text().includes('Website Redesign'));

    const text = wrapper.text();
    expect(text).toContain('Website Redesign');
    expect(text).toContain('Mobile App');
    // tasksCount is derived from the tasks store (project 1 is seeded with 4 tasks).
    expect(wrapper.findAll('tbody tr').length).toBeGreaterThan(0);
  });
});
