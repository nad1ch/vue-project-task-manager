import { z } from 'zod';

export const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  description: z
    .string()
    .trim()
    .max(500, 'Description must be at most 500 characters')
    .optional(),
  status: z.enum(['active', 'archived']),
});

export const projectUpdateSchema = projectSchema.partial();

export type ProjectFormValues = z.infer<typeof projectSchema>;
