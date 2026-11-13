import { ROLE_LABEL } from '@/shared/auth/permissions';
import { seedUsers } from '@/mocks/seed/people';

/** Shown only while the mock backend is active, so testers can sign in without hunting for credentials. */
export function DemoAccounts({ onPick }: { onPick: (email: string, password: string) => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-panel border border-dashed border-line-strong p-5">
      <p className="text-sm text-muted">
        Demo mode. Pick an account to fill the form. Managers can edit the menu, floor staff run orders only.
      </p>
      <div className="flex flex-wrap gap-2">
        {seedUsers.map((user) => (
          <button
            key={user.id}
            type="button"
            onClick={() => onPick(user.email, user.password)}
            className="flex flex-col items-start rounded-field bg-surface px-4 py-2.5 text-left ring-1 ring-line ring-inset transition hover:ring-ink"
          >
            <span className="text-sm font-semibold">{user.name}</span>
            <span className="text-xs text-muted">{ROLE_LABEL[user.role]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
