import { Suspense, useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import { useAuth } from '@/shared/auth/auth-context';
import { can } from '@/shared/auth/permissions';
import { fill, formatNumber, t } from '@/shared/i18n';
import { cn } from '@/shared/lib/cn';
import { Logo } from '@/shared/ui/Logo';
import { X } from '@phosphor-icons/react';
import { IconButton } from '@/shared/ui/Button';
import { Overlay } from '@/shared/ui/Overlay';
import { Skeleton } from '@/shared/ui/states';
import { useNewOrderAlerts } from '../hooks/useNewOrderAlerts';
import { AccountActions, Avatar } from './AccountActions';
import { NAV_ITEMS } from './nav';

function CountBadge({ count, className }: { count: number; className?: string }) {
  if (!count) return null;
  return (
    <span
      key={count}
      aria-label={fill(t.dashboard.nav.newCount, { count })}
      className={cn(
        'grid h-5 min-w-5 animate-pop place-items-center rounded-full bg-tomato px-1.5 font-mono text-[11px] font-bold text-white',
        className,
      )}
    >
      {formatNumber(count)}
    </span>
  );
}

function PageFallback() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-label={t.common.loading}>
      <Skeleton className="h-14 w-72" />
      <Skeleton className="h-40 w-full rounded-panel" />
      <Skeleton className="h-72 w-full rounded-panel" />
    </div>
  );
}

export function DashboardLayout() {
  const { user } = useAuth();
  const newOrders = useNewOrderAlerts();
  const [accountOpen, setAccountOpen] = useState(false);
  const items = NAV_ITEMS.filter((item) => !item.permission || can(user, item.permission));

  return (
    <div className="min-h-dvh bg-paper">
      {/* Desktop rail */}
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 flex-col bg-ink px-4 py-6 text-paper lg:flex">
        <div className="flex items-center justify-between px-2">
          <Logo tone="paper" />
          <span className="rounded-full bg-paper/10 px-2.5 py-1 text-[11px] text-paper/70">{t.dashboard.kitchen}</span>
        </div>
        <nav aria-label={t.dashboard.nav.label} className="mt-10 flex flex-col gap-1">
          {items.map(({ to, label, icon: Icon, end, showNewOrders }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex h-11 items-center gap-3 rounded-full px-4 text-[15px] font-semibold transition-colors',
                  isActive ? 'bg-paper text-ink' : 'text-paper/75 hover:bg-paper/10 hover:text-paper',
                )
              }
            >
              <Icon size={20} weight="bold" aria-hidden />
              <span className="flex-1">{label}</span>
              {showNewOrders && <CountBadge count={newOrders} />}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto">
          <AccountActions />
        </div>
      </aside>

      {/* Small screens: top bar + bottom tabs */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-ink px-4 text-paper lg:hidden">
        <Logo tone="paper" className="scale-90 origin-right" />
        {user && (
          <button type="button" onClick={() => setAccountOpen(true)} aria-label={t.dashboard.account.button} className="-me-1 grid size-11 place-items-center rounded-full">
            <Avatar name={user.name} className="size-9" />
          </button>
        )}
      </header>
      <nav
        aria-label={t.dashboard.nav.label}
        className="fixed inset-x-0 bottom-0 z-30 grid border-t border-paper/10 bg-ink pb-[env(safe-area-inset-bottom)] text-paper lg:hidden"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map(({ to, label, icon: Icon, end, showNewOrders }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold',
                isActive ? 'text-paper' : 'text-paper/55',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} weight={isActive ? 'fill' : 'bold'} aria-hidden />
                {label}
                {showNewOrders && <CountBadge count={newOrders} className="absolute top-2 start-1/2 ms-2" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <Overlay open={accountOpen} onClose={() => setAccountOpen(false)} label={t.dashboard.account.title} className="bg-ink text-paper">
        <div className="flex items-center justify-between px-5 pt-5">
          <p className="display text-3xl">{t.dashboard.account.title}</p>
          <IconButton icon={X} label={t.common.close} onClick={() => setAccountOpen(false)} className="text-paper hover:bg-paper/10" />
        </div>
        <div className="p-4 pb-8">
          <AccountActions />
        </div>
      </Overlay>

      <main className="px-4 pt-6 pb-28 sm:px-6 lg:pt-10 lg:pe-10 lg:pb-16 lg:ps-[calc(16rem+2.5rem)]">
        <div className="mx-auto max-w-[1400px]">
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
