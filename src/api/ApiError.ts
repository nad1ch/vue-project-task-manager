import { ApiErrorCode, type ApiFieldError } from '@/types';

export interface ApiErrorParams {
  code: ApiErrorCode;
  status: number;
  message: string;
  fieldErrors?: ApiFieldError[];
}

/** The single error type that crosses the service boundary. Components never see AxiosError. */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly fieldErrors?: ApiFieldError[];

  constructor({ code, status, message, fieldErrors }: ApiErrorParams) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}
