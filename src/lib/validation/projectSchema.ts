import { z } from 'zod';

// Messages are i18n keys, translated where displayed / when an ApiError is built.
export const projectSchema = z.object({
  name: z.string().trim().min(2, 'errors.projectNameMin').max(100, 'errors.projectNameMax'),
  description: z.string().trim().max(500, 'errors.projectDescMax').optional(),
  status: z.enum(['active', 'archived']),
});

export const projectUpdateSchema = projectSchema.partial();

export type ProjectFormValues = z.infer<typeof projectSchema>;
