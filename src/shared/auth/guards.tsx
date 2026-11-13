import type { ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router';
import { LockKey } from '@phosphor-icons/react';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
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
        <span className="font-mono text-sm text-muted">Checking your session</span>
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
  useDocumentTitle('No access');
  return (
    <EmptyState
      icon={LockKey}
      title="This area is for managers"
      description="Your account can run orders but cannot change the menu. Ask a manager if you need access."
      action={
        <Link to="/dashboard/orders" className={buttonStyles({ variant: 'secondary' })}>
          Go to orders
        </Link>
      }
    />
  );
}

export function RequirePermission({ permission, children }: { permission: Permission; children: ReactNode }) {
  return useCan(permission) ? children : <NoAccess />;
}
