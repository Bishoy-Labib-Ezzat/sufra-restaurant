import type { ApiErrorBody } from '@/shared/types';
import { apiConfig } from './config';
import { ApiError } from './errors';

type QueryValue = string | number | boolean | null | undefined | readonly string[];
export type QueryParams = Record<string, QueryValue>;

interface RequestOptions {
  query?: QueryParams;
  body?: unknown;
  signal?: AbortSignal;
}

interface ClientHooks {
  getToken: () => string | null;
  onUnauthorized: () => void;
  /** How requests are sent. The mock backend swaps this for an in-page implementation. */
  transport: typeof fetch;
}

let hooks: ClientHooks = {
  getToken: () => null,
  onUnauthorized: () => {},
  transport: (input, init) => fetch(input, init),
};

/** Lets the auth layer and the mock backend plug into every request. */
export function configureApiClient(next: Partial<ClientHooks>) {
  hooks = { ...hooks, ...next };
}

function buildUrl(path: string, query?: QueryParams) {
  const url = new URL(`${apiConfig.baseUrl}${path}`, window.location.origin);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) value.forEach((item) => url.searchParams.append(key, item));
    else url.searchParams.set(key, String(value));
  }
  return url.toString();
}

async function request<T>(method: string, path: string, { query, body, signal }: RequestOptions = {}) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort('timeout'), apiConfig.timeoutMs);
  const forwardAbort = () => controller.abort(signal?.reason);
  signal?.addEventListener('abort', forwardAbort, { once: true });

  const token = hooks.getToken();
  const isFormData = body instanceof FormData;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined && !isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await hooks.transport(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    // A cancellation requested by the caller (e.g. React Query) must surface as-is.
    if (signal?.aborted) throw error;
    if (controller.signal.reason === 'timeout') {
      throw ApiError.network('The server took too long to respond. Please try again.');
    }
    throw ApiError.network();
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener('abort', forwardAbort);
  }

  if (response.status === 204) return undefined as T;

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && token) hooks.onUnauthorized();
    const errorBody = (payload as ApiErrorBody | null) ?? {
      code: 'http_error',
      message: `Request failed with status ${response.status}.`,
    };
    throw new ApiError(response.status, errorBody);
  }
  return payload as T;
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'body'>) => request<T>('GET', path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, { ...options, body }),
  delete: <T = void>(path: string, options?: RequestOptions) => request<T>('DELETE', path, options),
};
