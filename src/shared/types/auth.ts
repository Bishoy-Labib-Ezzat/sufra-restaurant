export type StaffRole = 'admin' | 'staff';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  title: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthSession {
  token: string;
  expiresAt: string;
  user: StaffUser;
}
