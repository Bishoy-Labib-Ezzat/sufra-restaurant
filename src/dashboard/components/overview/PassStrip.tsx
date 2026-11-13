import { Fragment } from 'react';
import { Link } from 'react-router';
import { CaretRight } from '@phosphor-icons/react';
import { formatElapsed } from '@/shared/lib/format';
import { OPEN_STATUSES, STATUS_META } from '@/shared/lib/order-status';
import { cn } from '@/shared/lib/cn';
import type { Order } from '@/shared/types';

/** The pipeline at a glance: how many orders sit at each step, and how long the oldest has waited. */
export function PassStrip({ orders, now }: { orders: Order[]; now: number }) {
  return (
    <section aria-label="Orders in progress" className="scrollbar-none -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="flex min-w-max items-stretch rounded-panel bg-ink p-2 text-paper sm:min-w-0">
        {OPEN_STATUSES.map((status, index) => {
          const lane = orders.filter((order) => order.status === status);
          const oldest = lane.reduce<string | null>((min, order) => (!min || order.createdAt < min ? order.createdAt : min), null);
          const urgent = status === 'new' && lane.length > 0;
          return (
            <Fragment key={status}>
              {index > 0 && <CaretRight size={18} weight="bold" className="shrink-0 self-center text-paper/30" aria-hidden />}
              <Link
                to="/dashboard/orders"
                className="flex w-40 flex-col gap-2 rounded-[16px] px-4 py-3 transition-colors hover:bg-paper/8 sm:w-auto sm:flex-1"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-paper/80">
                  <span className={cn('size-2 rounded-full', STATUS_META[status].tone.marker)} aria-hidden />
                  {STATUS_META[status].label}
                </span>
                <span className={cn('display text-6xl leading-none', urgent && 'text-[#ff8a6f]')}>{lane.length}</span>
                <span className="text-xs text-paper/60">{oldest ? `Oldest ${formatElapsed(oldest, now)}` : 'Nothing waiting'}</span>
              </Link>
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
