import { useState } from 'react';
import { ArrowCounterClockwise, ArrowUpRight, SignOut } from '@phosphor-icons/react';
import { useQueryClient } from '@tanstack/react-query';
import { apiConfig } from '@/shared/api/config';
import { useAuth } from '@/shared/auth/auth-context';
import { ROLE_LABEL } from '@/shared/auth/permissions';
import { initials } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { toast } from '@/shared/ui/toast-store';

export function Avatar({ name, className }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('grid size-10 shrink-0 place-items-center rounded-full bg-tomato font-display text-sm font-bold text-white', className)}
    >
      {initials(name)}
    </span>
  );
}

const linkRow =
  'flex h-11 items-center gap-3 rounded-full px-4 text-[15px] font-semibold text-paper/75 transition-colors hover:bg-paper/10 hover:text-paper';

/** Shop link, demo reset and sign out. Shared by the desktop rail and the mobile account sheet. */
export function AccountActions() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [confirmReset, setConfirmReset] = useState(false);

  const resetDemo = async () => {
    const { resetMockDatabase } = await import('@/mocks/db');
    resetMockDatabase();
    queryClient.clear();
    setConfirmReset(false);
    logout('manual');
    toast.success('Demo data restored. Sign in again to continue.');
  };

  if (!user) return null;
  return (
    <div className="flex flex-col gap-1">
      <a href="/" target="_blank" rel="noreferrer" className={linkRow}>
        <ArrowUpRight size={18} weight="bold" aria-hidden />
        Open the shop
      </a>
      {apiConfig.useMocks && (
        <button type="button" onClick={() => setConfirmReset(true)} className={linkRow}>
          <ArrowCounterClockwise size={18} weight="bold" aria-hidden />
          Reset demo data
        </button>
      )}
      <div className="mt-3 flex items-center gap-3 border-t border-paper/12 pt-4">
        <Avatar name={user.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-paper">{user.name}</p>
          <p className="truncate text-sm text-paper/60">{ROLE_LABEL[user.role]}</p>
        </div>
        <button
          type="button"
          onClick={() => logout('manual')}
          aria-label="Sign out"
          title="Sign out"
          className="grid size-10 place-items-center rounded-full text-paper/75 transition-colors hover:bg-paper/10 hover:text-paper"
        >
          <SignOut size={20} weight="bold" />
        </button>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Reset the demo?"
        description="This puts back the original menu and a fresh week of orders. Anything you added or changed is lost, and you will be signed out."
        confirmLabel="Reset demo data"
        cancelLabel="Cancel"
        tone="danger"
        onConfirm={resetDemo}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
}
