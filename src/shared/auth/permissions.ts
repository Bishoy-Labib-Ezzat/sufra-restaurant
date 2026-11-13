import type { StaffRole, StaffUser } from '@/shared/types';

export type Permission = 'orders:manage' | 'stats:view' | 'menu:manage';

const ROLE_PERMISSIONS: Record<StaffRole, Permission[]> = {
  admin: ['orders:manage', 'stats:view', 'menu:manage'],
  staff: ['orders:manage', 'stats:view'],
};

export const ROLE_LABEL: Record<StaffRole, string> = {
  admin: 'Manager',
  staff: 'Floor staff',
};

export function can(user: StaffUser | null, permission: Permission) {
  return Boolean(user && ROLE_PERMISSIONS[user.role].includes(permission));
}
