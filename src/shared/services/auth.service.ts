import { apiClient } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type { AuthSession, LoginRequest, StaffUser } from '@/shared/types';

export const authService = {
  login: (credentials: LoginRequest) => apiClient.post<AuthSession>(endpoints.auth.login, credentials),
  logout: () => apiClient.post<void>(endpoints.auth.logout),
  me: (signal?: AbortSignal) => apiClient.get<StaffUser>(endpoints.auth.me, { signal }),
};
