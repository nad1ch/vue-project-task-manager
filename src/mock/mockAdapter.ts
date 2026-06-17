import MockAdapter from 'axios-mock-adapter';
import { http } from '@/api/http';
import { ApiErrorCode } from '@/types';
import { db } from './db';
import { registerProjectHandlers } from './handlers/projects.handler';
import { registerTaskHandlers } from './handlers/tasks.handler';

let installed = false;

/** Mount the mock backend on the shared Axios instance. Idempotent. */
export function installMock(): void {
  if (installed) return;
  installed = true;

  db.init();

  const mock = new MockAdapter(http, { delayResponse: 0 });
  registerProjectHandlers(mock);
  registerTaskHandlers(mock);

  // Any unmatched route is a 404 so a typo never silently succeeds.
  mock.onAny().reply(() => [404, { code: ApiErrorCode.NotFound, message: 'No such endpoint' }]);
}
