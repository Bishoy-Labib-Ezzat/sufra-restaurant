import { createContext, useContext } from 'react';
import type { LoginRequest, StaffUser } from '@/shared/types';
import { can, type Permission } from './permissions';

export type AuthStatus = 'checking' | 'authenticated' | 'anonymous';

export interface AuthContextValue {
  status: AuthStatus;
  user: StaffUser | null;
  login: (credentials: LoginRequest, options: { remember: boolean }) => Promise<StaffUser>;
  logout: (reason?: 'manual' | 'expired') => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.');
  return context;
}

export function useCan(permission: Permission) {
  return can(useAuth().user, permission);
}
