import { Suspense } from 'react';
import { Outlet } from 'react-router';
import { AuthProvider } from '@/shared/auth/AuthProvider';
import { t } from '@/shared/i18n';

function ScreenFallback() {
  return (
    <div className="grid min-h-dvh place-items-center bg-paper" role="status" aria-live="polite">
      <span className="font-mono text-sm text-muted">{t.dashboard.loading}</span>
    </div>
  );
}

/** Everything under /dashboard shares one auth session. */
export function DashboardRoot() {
  return (
    <AuthProvider>
      <Suspense fallback={<ScreenFallback />}>
        <Outlet />
      </Suspense>
    </AuthProvider>
  );
}
