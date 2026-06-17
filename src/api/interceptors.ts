import type { AxiosInstance } from 'axios';
import { normalizeError } from './normalizeError';

/** Reject every failure with a typed ApiError so nothing past this layer sees AxiosError. */
export function installInterceptors(instance: AxiosInstance): void {
  instance.interceptors.response.use(
    (response) => response,
    (error: unknown) => Promise.reject(normalizeError(error)),
  );
}
