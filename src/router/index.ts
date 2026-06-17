import { createRouter, createWebHashHistory } from 'vue-router';
import { routes } from './routes';

export const router = createRouter({
  // Hash history keeps deep links (e.g. #/projects/1) stable on GitHub Pages
  // refreshes without needing a server-side SPA fallback.
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});
