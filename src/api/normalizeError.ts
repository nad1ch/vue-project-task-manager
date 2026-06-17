import axios from 'axios';
import { ApiErrorCode, type ServerErrorBody } from '@/types';
import { ApiError } from './ApiError';

const STATUS_TO_CODE: Record<number, ApiErrorCode> = {
  404: ApiErrorCode.NotFound,
  422: ApiErrorCode.Validation,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Convert any thrown value into a typed ApiError. Idempotent for ApiError. */
export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    if (status === 0) {
      return new ApiError({
        code: ApiErrorCode.Network,
        status: 0,
        message: 'Network unavailable. Please try again.',
      });
    }
    const data: unknown = error.response?.data;
    const body: ServerErrorBody = isRecord(data) ? (data as ServerErrorBody) : {};
    const code = body.code ?? STATUS_TO_CODE[status] ?? ApiErrorCode.Unknown;
    return new ApiError({
      code,
      status,
      message: body.message ?? error.message,
      fieldErrors: body.fieldErrors,
    });
  }

  return new ApiError({
    code: ApiErrorCode.Unknown,
    status: 0,
    message: error instanceof Error ? error.message : 'Unexpected error.',
  });
}
