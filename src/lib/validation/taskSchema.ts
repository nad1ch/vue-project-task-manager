import { z } from 'zod';
import { ASSIGNEES } from '@/constants';
import { isPastDate, isValidDateString } from '@/lib/date';

const assigneeSchema = z.enum(ASSIGNEES).nullable();

const baseShape = {
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title must be at most 120 characters'),
  status: z.enum(['todo', 'in_progress', 'done']),
  assignee: assigneeSchema,
};

/** Create: due date must be a valid date that is today or later. */
export const taskCreateSchema = z.object({
  ...baseShape,
  dueDate: z
    .string()
    .refine(isValidDateString, 'A valid due date is required')
    .refine((value) => !isPastDate(value), 'Due date must be today or later'),
});

/**
 * Update: all fields optional, and the past-date rule is relaxed so existing
 * (already overdue) tasks can still have unrelated fields edited. `order` is
 * the internal DnD position.
 */
export const taskUpdateSchema = z
  .object({
    ...baseShape,
    dueDate: z.string().refine(isValidDateString, 'A valid due date is required'),
    order: z.number().int().min(0),
  })
  .partial();

export type TaskCreateValues = z.infer<typeof taskCreateSchema>;
export type TaskUpdateValues = z.infer<typeof taskUpdateSchema>;
