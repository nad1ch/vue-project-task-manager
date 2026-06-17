import axios, { type AxiosInstance } from 'axios';
import { installInterceptors } from './interceptors';

/** Single shared Axios instance. The mock adapter mounts on this exact instance. */
export const http: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

installInterceptors(http);
