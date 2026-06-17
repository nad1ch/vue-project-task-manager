import type { RouteRecordRaw } from 'vue-router';
import { RouteNames } from './routeNames';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: { name: RouteNames.Projects },
  },
  {
    path: '/projects',
    name: RouteNames.Projects,
    component: () => import('@/pages/ProjectsPage.vue'),
  },
  {
    path: '/projects/:id',
    name: RouteNames.ProjectDetails,
    component: () => import('@/pages/ProjectDetailsPage.vue'),
  },
  {
    path: '/dashboard',
    name: RouteNames.Dashboard,
    component: () => import('@/pages/DashboardPage.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: RouteNames.NotFound,
    component: () => import('@/pages/NotFoundPage.vue'),
  },
];
