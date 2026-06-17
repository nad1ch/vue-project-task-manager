import { z } from 'zod';
import { ASSIGNEES } from '@/constants';
import { isPastDate, isValidDateString } from '@/lib/date';

// Treat an empty selection as "unassigned" (null) before validating against the list.
const assigneeSchema = z.preprocess(
  (value) => (value === '' ? null : value),
  z.enum(ASSIGNEES).nullable(),
);

const baseShape = {
  // Messages are i18n keys, translated where displayed / when an ApiError is built.
  title: z.string().trim().min(3, 'errors.taskTitleMin').max(120, 'errors.taskTitleMax'),
  status: z.enum(['todo', 'in_progress', 'done']),
  assignee: assigneeSchema,
};

/** Create: due date must be a valid date that is today or later. */
export const taskCreateSchema = z.object({
  ...baseShape,
  dueDate: z
    .string()
    .refine(isValidDateString, 'errors.taskDueValid')
    .refine((value) => !isPastDate(value), 'errors.taskDuePast'),
});

/**
 * Edit: same required shape as create, but the past-date rule is relaxed so an
 * already-overdue task can still be edited.
 */
export const taskEditSchema = z.object({
  ...baseShape,
  dueDate: z.string().refine(isValidDateString, 'errors.taskDueValid'),
});

/**
 * Update DTO (service-level): all fields optional, past date allowed. `order` is
 * the internal DnD position.
 */
export const taskUpdateSchema = z
  .object({
    ...baseShape,
    dueDate: z.string().refine(isValidDateString, 'errors.taskDueValid'),
    order: z.number().int().min(0),
  })
  .partial();

export type TaskCreateValues = z.infer<typeof taskCreateSchema>;
export type TaskUpdateValues = z.infer<typeof taskUpdateSchema>;
