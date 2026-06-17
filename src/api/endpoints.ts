export const ENDPOINTS = {
  projects: '/projects',
  project: (id: number): string => `/projects/${id}`,
  tasks: '/tasks',
  task: (id: number): string => `/tasks/${id}`,
} as const;
