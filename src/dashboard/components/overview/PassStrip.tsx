import { Fragment } from 'react';
import { Link } from 'react-router';
import { CaretLeft } from '@phosphor-icons/react';
import { fill, formatNumber, t } from '@/shared/i18n';
import { formatElapsed } from '@/shared/lib/format';
import { OPEN_STATUSES, STATUS_META } from '@/shared/lib/order-status';
import { cn } from '@/shared/lib/cn';
import type { Order } from '@/shared/types';

/** The pipeline at a glance: how many orders sit at each step, and how long the oldest has waited. */
export function PassStrip({ orders, now }: { orders: Order[]; now: number }) {
  return (
    // Phones: one row per status (name and wait at the start, count at the end).
    // From tablet width: the horizontal pipeline with arrows between steps.
    <section aria-label={t.dashboard.overview.passLabel}>
      <div className="flex flex-col rounded-panel bg-ink p-2 text-paper md:flex-row md:items-stretch">
        {OPEN_STATUSES.map((status, index) => {
          const lane = orders.filter((order) => order.status === status);
          const oldest = lane.reduce<string | null>((min, order) => (!min || order.createdAt < min ? order.createdAt : min), null);
          const urgent = status === 'new' && lane.length > 0;
          return (
            <Fragment key={status}>
              {index > 0 && (
                <CaretLeft size={18} weight="bold" className="hidden shrink-0 self-center text-paper/30 md:block" aria-hidden />
              )}
              <Link
                to="/dashboard/orders"
                className={cn(
                  'grid min-h-14 grid-cols-[1fr_auto] items-center gap-x-3 rounded-[16px] px-4 py-2.5 transition-colors hover:bg-paper/8',
                  'md:flex md:flex-1 md:flex-col md:items-start md:gap-2 md:py-3',
                )}
              >
                <span className="col-start-1 row-start-1 flex items-center gap-2 text-sm font-semibold text-paper/80">
                  <span className={cn('size-2 rounded-full', STATUS_META[status].tone.marker)} aria-hidden />
                  {STATUS_META[status].label}
                </span>
                <span
                  className={cn(
                    'display col-start-2 row-span-2 row-start-1 text-4xl leading-none md:text-6xl',
                    urgent && 'text-[#ff8a6f]',
                  )}
                >
                  {formatNumber(lane.length)}
                </span>
                <span className="col-start-1 row-start-2 text-xs text-paper/60">
                  {oldest ? fill(t.dashboard.overview.oldest, { time: formatElapsed(oldest, now) }) : t.dashboard.overview.nothingWaiting}
                </span>
              </Link>
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
