import { RequireAuth } from '@/shared/auth/guards';
import { DashboardLayout } from './DashboardLayout';

export function ProtectedDashboard() {
  return (
    <RequireAuth>
      <DashboardLayout />
    </RequireAuth>
  );
}
