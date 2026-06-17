import { ApiErrorCode } from '@/types';
import { delay, shouldFault } from '../latency';

/** A mock-adapter reply tuple: [status, body]. */
export type Reply = [number, unknown?];

export function errorReply(status: number, code: ApiErrorCode, message: string): Reply {
  return [status, { code, message }];
}

export function notFound(message: string): Reply {
  return errorReply(404, ApiErrorCode.NotFound, message);
}

/** Wrap a handler with simulated latency + optional fault injection. */
export async function withMock(run: () => Reply): Promise<Reply> {
  await delay();
  if (shouldFault()) return errorReply(500, ApiErrorCode.Unknown, 'Simulated server error');
  return run();
}

/** Parse the trailing numeric id from a request url. */
export function idFromUrl(url: string | undefined): number {
  const match = (url ?? '').match(/(\d+)$/);
  const group = match?.[1];
  return group === undefined ? Number.NaN : Number(group);
}

export function parseBody<T>(data: unknown): T {
  if (typeof data === 'string') return JSON.parse(data) as T;
  return (data ?? {}) as T;
}
