import type { ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router';
import { LockKey } from '@phosphor-icons/react';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { t } from '@/shared/i18n';
import { EmptyState } from '@/shared/ui/EmptyState';
import { buttonStyles } from '@/shared/ui/button-styles';
import { useAuth, useCan } from './auth-context';
import type { Permission } from './permissions';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'checking') {
    return (
      <div className="grid min-h-dvh place-items-center bg-paper" role="status" aria-live="polite">
        <span className="font-mono text-sm text-muted">{t.dashboard.checkingSession}</span>
      </div>
    );
  }
  if (status === 'anonymous') {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/dashboard/login?next=${encodeURIComponent(next)}`} replace />;
  }
  return children;
}

function NoAccess() {
  useDocumentTitle(t.dashboard.access.title);
  return (
    <EmptyState
      icon={LockKey}
      title={t.dashboard.access.heading}
      description={t.dashboard.access.body}
      action={
        <Link to="/dashboard/orders" className={buttonStyles({ variant: 'secondary' })}>
          {t.dashboard.access.toOrders}
        </Link>
      }
    />
  );
}

export function RequirePermission({ permission, children }: { permission: Permission; children: ReactNode }) {
  return useCan(permission) ? children : <NoAccess />;
}
