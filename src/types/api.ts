export const ApiErrorCode = {
  NotFound: 'NOT_FOUND',
  Validation: 'VALIDATION',
  Network: 'NETWORK',
  Unknown: 'UNKNOWN',
} as const;
export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

export interface ApiFieldError {
  field: string;
  message: string;
}

/** Body shape the mock backend uses for error responses. */
export interface ServerErrorBody {
  code?: ApiErrorCode;
  message?: string;
  fieldErrors?: ApiFieldError[];
}
