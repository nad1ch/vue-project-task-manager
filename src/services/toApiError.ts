import type { ZodError } from 'zod';
import { ApiError } from '@/api';
import { ApiErrorCode, type ApiFieldError } from '@/types';

/** Convert a zod validation error into a typed VALIDATION ApiError with field errors. */
export function zodToApiError(error: ZodError): ApiError {
  const fieldErrors: ApiFieldError[] = error.issues.map((issue) => ({
    field: String(issue.path[0] ?? ''),
    message: issue.message,
  }));
  return new ApiError({
    code: ApiErrorCode.Validation,
    status: 422,
    message: fieldErrors[0]?.message ?? 'Validation failed',
    fieldErrors,
  });
}
