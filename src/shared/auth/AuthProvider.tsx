import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { configureApiClient } from '@/shared/api/client';
import { queryKeys } from '@/shared/api/query-keys';
import { t } from '@/shared/i18n';
import { authService } from '@/shared/services/auth.service';
import { toast } from '@/shared/ui/toast-store';
import type { LoginRequest, StaffUser } from '@/shared/types';
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context';
import { tokenStorage } from './token-storage';

configureApiClient({ getToken: () => tokenStorage.get() });

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<StaffUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() => (tokenStorage.get() ? 'checking' : 'anonymous'));

  const logout = useCallback<AuthContextValue['logout']>(
    (reason = 'manual') => {
      if (reason === 'manual' && tokenStorage.get()) authService.logout().catch(() => {});
      tokenStorage.clear();
      setUser(null);
      setStatus('anonymous');
      // Staff data must not survive into the next session on a shared counter tablet.
      queryClient.removeQueries({ queryKey: queryKeys.orders.all });
      queryClient.removeQueries({ queryKey: queryKeys.stats.overview });
      if (reason === 'expired') toast.info(t.dashboard.account.sessionExpired);
    },
    [queryClient],
  );

  useEffect(() => {
    configureApiClient({ onUnauthorized: () => logout('expired') });
  }, [logout]);

  // Restore the session from a stored token once on load.
  useEffect(() => {
    if (status !== 'checking') return;
    const controller = new AbortController();
    authService
      .me(controller.signal)
      .then((me) => {
        setUser(me);
        setStatus('authenticated');
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        tokenStorage.clear();
        setStatus('anonymous');
      });
    return () => controller.abort();
  }, [status]);

  const login = useCallback<AuthContextValue['login']>(async (credentials: LoginRequest, { remember }) => {
    const session = await authService.login(credentials);
    tokenStorage.set({ token: session.token, expiresAt: session.expiresAt }, remember);
    setUser(session.user);
    setStatus('authenticated');
    return session.user;
  }, []);

  const value = useMemo(() => ({ status, user, login, logout }), [status, user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
