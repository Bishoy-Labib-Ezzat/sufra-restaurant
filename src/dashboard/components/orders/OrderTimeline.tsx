import { fill, t } from '@/shared/i18n';
import { formatDateTime } from '@/shared/lib/format';
import { STATUS_META } from '@/shared/lib/order-status';
import { cn } from '@/shared/lib/cn';
import type { OrderStatusChange } from '@/shared/types';

/** Audit trail of status changes, newest first. */
export function OrderTimeline({ history }: { history: OrderStatusChange[] }) {
  const entries = [...history].reverse();
  return (
    <ol className="flex flex-col">
      {entries.map((entry, index) => (
        <li key={`${entry.status}-${entry.at}`} className="grid grid-cols-[1rem_1fr] gap-x-3">
          <div className="flex flex-col items-center pt-1.5">
            <span className={cn('size-2.5 shrink-0 rounded-full', STATUS_META[entry.status].tone.marker)} aria-hidden />
            {index < entries.length - 1 && <span className="mt-1 w-px flex-1 bg-line-strong" />}
          </div>
          <div className="flex flex-col gap-0.5 pb-5">
            <p className="text-[15px] font-semibold">
              {entry.status === 'new' ? t.dashboard.orders.placedOnline : STATUS_META[entry.status].label}
            </p>
            <p className="text-sm text-muted">
              <span className="font-mono">{formatDateTime(entry.at)}</span>
              {entry.by && <> {fill(t.dashboard.orders.by, { name: entry.by })}</>}
            </p>
            {entry.note && <p className="mt-1 text-sm text-ink-soft">«{entry.note}»</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
