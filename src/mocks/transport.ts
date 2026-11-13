import { getResponse } from 'msw';
import { handlers } from './handlers';

/**
 * A drop-in replacement for `fetch` that answers API requests inside the page using the mock
 * handlers. It needs no service worker, so it also works in private windows and embedded browsers.
 * Requests no handler matches go to the real network.
 */
export function mockFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const request = new Request(input, init);
  if (request.signal.aborted) return Promise.reject(request.signal.reason);

  return new Promise((resolve, reject) => {
    const onAbort = () => reject(request.signal.reason ?? new DOMException('The request was aborted.', 'AbortError'));
    request.signal.addEventListener('abort', onAbort, { once: true });
    getResponse(handlers, request.clone())
      .then((response) => response ?? fetch(request))
      .then(resolve, reject)
      .finally(() => request.signal.removeEventListener('abort', onAbort));
  });
}
