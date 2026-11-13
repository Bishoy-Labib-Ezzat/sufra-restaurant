import type { ReactNode } from 'react';
import { formatAmount, formatMoney, formatTime } from '@/shared/lib/format';
import type { DashboardOverview } from '@/shared/types';

function Line({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="shrink-0 text-ink-soft">{label}</dt>
      <span aria-hidden className="flex-1 -translate-y-1 border-b border-dotted border-line-strong" />
      <dd className="font-mono font-semibold tabular">{children}</dd>
    </div>
  );
}

function Change({ today, yesterday }: { today: number; yesterday: number }) {
  if (!yesterday) return <span className="text-muted">No sales yesterday to compare with.</span>;
  const share = Math.round((today / yesterday) * 100);
  return (
    <span>
      Today has reached <span className="font-mono font-semibold">{share}%</span> of yesterday&rsquo;s full-day revenue
      ({formatMoney(yesterday)}).
    </span>
  );
}

/** Today's numbers printed like an end-of-shift till receipt. */
export function TodayTally({ overview }: { overview: DashboardOverview }) {
  const { today, yesterday, fulfillmentSplit } = overview;
  const totalWeek = fulfillmentSplit.delivery + fulfillmentSplit.pickup;
  const deliveryShare = totalWeek ? Math.round((fulfillmentSplit.delivery / totalWeek) * 100) : 0;

  return (
    <section aria-labelledby="tally-title" className="ticket bg-surface px-6 py-7 shadow-lift">
      <div className="flex items-baseline justify-between">
        <h2 id="tally-title" className="display text-3xl">
          Today so far
        </h2>
        <span className="font-mono text-xs text-muted">as of {formatTime(overview.generatedAt)}</span>
      </div>

      <dl className="mt-5 flex flex-col gap-3 text-[15px]">
        <Line label="Revenue">
          <span className="text-xs font-medium text-muted">EGP </span>
          {formatAmount(today.revenue)}
        </Line>
        <Line label="Orders">{today.orders}</Line>
        <Line label="Average order">
          <span className="text-xs font-medium text-muted">EGP </span>
          {formatAmount(today.averageOrder)}
        </Line>
        <Line label="Open right now">{overview.openOrders}</Line>
      </dl>

      <p className="mt-5 border-t border-dashed border-line-strong pt-4 text-sm">
        <Change today={today.revenue} yesterday={yesterday.revenue} />
      </p>

      <div className="mt-4 border-t border-dashed border-line-strong pt-4">
        <p className="text-sm font-semibold">How orders left the kitchen this week</p>
        {totalWeek ? (
          <>
            <div className="mt-3 flex h-2.5 gap-[2px]" aria-hidden>
              <span className="rounded-l-[4px] bg-ink" style={{ width: `${deliveryShare}%` }} />
              <span className="rounded-r-[4px] bg-tomato" style={{ width: `${100 - deliveryShare}%` }} />
            </div>
            <ul className="mt-2 flex justify-between text-sm">
              <li className="flex items-center gap-2">
                <span className="size-2.5 rounded-sm bg-ink" aria-hidden />
                Delivery <span className="font-mono font-semibold">{deliveryShare}%</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="size-2.5 rounded-sm bg-tomato" aria-hidden />
                Pickup <span className="font-mono font-semibold">{100 - deliveryShare}%</span>
              </li>
            </ul>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted">No orders this week yet.</p>
        )}
      </div>
    </section>
  );
}
