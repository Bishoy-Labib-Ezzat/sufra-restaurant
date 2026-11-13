import { http, HttpResponse } from 'msw';
import { endpoints } from '@/shared/api/endpoints';
import type { AuthSession, LoginRequest } from '@/shared/types';
import { db } from '../db';
import { api, fail, readJson, requireUser, route } from '../utils';

const SESSION_HOURS = 12;

export const authHandlers = [
  http.post(
    api(endpoints.auth.login),
    route(async ({ request }) => {
      const { email = '', password = '' } = await readJson<LoginRequest>(request);
      if (!email.trim() || !password) {
        return fail(422, 'validation_error', 'Enter your email and password.');
      }

      const session = db.write((data): AuthSession | null => {
        const user = data.users.find(
          (item) => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password,
        );
        if (!user) return null;
        const token = `mock.${user.id}.${crypto.randomUUID()}`;
        const expiresAt = new Date(Date.now() + SESSION_HOURS * 3_600_000).toISOString();
        data.sessions = data.sessions.filter((item) => new Date(item.expiresAt).getTime() > Date.now());
        data.sessions.push({ token, userId: user.id, expiresAt });
        const { id, name, role, title } = user;
        return { token, expiresAt, user: { id, name, email: user.email, role, title } };
      });

      if (!session) return fail(401, 'invalid_credentials', 'That email and password do not match.');
      return HttpResponse.json(session);
    }),
  ),

  http.post(
    api(endpoints.auth.logout),
    route(({ request }) => {
      const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
      db.write((data) => {
        data.sessions = data.sessions.filter((item) => item.token !== token);
      });
      return new HttpResponse(null, { status: 204 });
    }),
  ),

  http.get(
    api(endpoints.auth.me),
    route(({ request }) => HttpResponse.json(requireUser(request))),
  ),
];
