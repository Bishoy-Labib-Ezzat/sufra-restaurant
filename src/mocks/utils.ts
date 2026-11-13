import { delay, HttpResponse, type DefaultBodyType, type HttpResponseResolver, type PathParams } from 'msw';
import { apiConfig } from '@/shared/api/config';
import type { ApiErrorBody, StaffRole, StaffUser } from '@/shared/types';
import { db } from './db';

const env = import.meta.env;
const latencyMin = Number(env.VITE_MOCK_LATENCY_MIN ?? 250);
const latencyMax = Number(env.VITE_MOCK_LATENCY_MAX ?? 700);
const errorRate = Number(env.VITE_MOCK_ERROR_RATE ?? 0);

/** Absolute handler path for an endpoint, e.g. api('/products/:id'). */
export const api = (path: string) => `${apiConfig.baseUrl}${path}`;

export function fail(status: number, code: string, message: string, fieldErrors?: Record<string, string>) {
  const body: ApiErrorBody = { code, message, ...(fieldErrors && { fieldErrors }) };
  return HttpResponse.json(body, { status });
}

type Resolver = (info: { request: Request; params: PathParams }) => Response | Promise<Response>;

/**
 * Wraps a mock handler with network latency, optional random failures, and support for
 * `throw fail(...)` from nested helpers such as `requireUser`.
 */
export function route(resolver: Resolver): HttpResponseResolver<PathParams, DefaultBodyType, undefined> {
  return async ({ request, params }) => {
    await delay(latencyMin + Math.random() * Math.max(0, latencyMax - latencyMin));
    if (errorRate > 0 && Math.random() < errorRate) {
      return fail(503, 'service_unavailable', 'The server is busy right now. Please try again.');
    }
    try {
      return await resolver({ request, params });
    } catch (error) {
      if (error instanceof Response) return error;
      console.error('[mock api]', error);
      return fail(500, 'server_error', 'Something went wrong on our side. Please try again.');
    }
  };
}

export async function readJson<T>(request: Request): Promise<Partial<T>> {
  try {
    return (await request.json()) as Partial<T>;
  } catch {
    throw fail(400, 'invalid_json', 'The request body is not valid JSON.');
  }
}

export const param = (params: PathParams, key: string) => String(params[key] ?? '');

/** Resolves the staff member behind the bearer token, or throws a 401/403 response. */
export function requireUser(request: Request, roles?: StaffRole[]): StaffUser {
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  const user = token
    ? db.read((data) => {
        const session = data.sessions.find((item) => item.token === token);
        if (!session || new Date(session.expiresAt).getTime() < Date.now()) return null;
        return data.users.find((item) => item.id === session.userId) ?? null;
      })
    : null;

  if (!user) throw fail(401, 'unauthorized', 'Your session has ended. Please sign in again.');
  if (roles && !roles.includes(user.role)) {
    throw fail(403, 'forbidden', 'Your account is not allowed to do this. Ask a manager.');
  }
  const { id, name, email, role, title } = user;
  return { id, name, email, role, title };
}

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
