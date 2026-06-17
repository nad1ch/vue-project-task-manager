import type { ProjectStatus } from './enums';

export interface Project {
  id: number;
  name: string;
  /** Optional. Absent or a non-empty trimmed string — never null. */
  description?: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}
