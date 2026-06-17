import type { ApiError } from '@/api';
import { ApiErrorCode } from '@/types';
import { t } from '@/i18n';

/** Map a typed ApiError to a localized, user-facing message (by code). */
export function localizeApiError(error: ApiError): string {
  switch (error.code) {
    case ApiErrorCode.Network:
      return t('errors.network');
    case ApiErrorCode.NotFound:
      return t('errors.notFound');
    case ApiErrorCode.Validation:
      // Validation messages are i18n keys produced by the zod schemas.
      return error.message ? t(error.message) : t('errors.validation');
    default:
      return t('errors.unexpected');
  }
}
