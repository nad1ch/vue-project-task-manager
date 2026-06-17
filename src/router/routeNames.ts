export const RouteNames = {
  Projects: 'projects',
  ProjectDetails: 'project-details',
  Dashboard: 'dashboard',
  NotFound: 'not-found',
} as const;

export type RouteName = (typeof RouteNames)[keyof typeof RouteNames];
