import type { AxiosRequestConfig } from 'axios';
import { http } from './http';

/** Generic typed client. Returns the response payload `T`; throws only ApiError. */
export const api = {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return http.get<T>(url, config).then((r) => r.data);
  },
  post<T, B>(url: string, body: B, config?: AxiosRequestConfig): Promise<T> {
    return http.post<T>(url, body, config).then((r) => r.data);
  },
  put<T, B>(url: string, body: B, config?: AxiosRequestConfig): Promise<T> {
    return http.put<T>(url, body, config).then((r) => r.data);
  },
  delete<T = void>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return http.delete<T>(url, config).then((r) => r.data);
  },
} as const;
