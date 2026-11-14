import type { ReactNode } from 'react';
import { fill, formatNumber, t } from '@/shared/i18n';
import { formatMoney, formatPercent, formatTime } from '@/shared/lib/format';
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
  if (!yesterday) return <span className="text-muted">{t.dashboard.overview.noYesterday}</span>;
  const share = Math.round((today / yesterday) * 100);
  return (
    <span>{fill(t.dashboard.overview.reached, { share: formatPercent(share), amount: formatMoney(yesterday) })}</span>
  );
}

/** Today's numbers printed like an end-of-shift till receipt. */
export function TodayTally({ overview }: { overview: DashboardOverview }) {
  const { today, yesterday, fulfillmentSplit } = overview;
  const totalWeek = fulfillmentSplit.delivery + fulfillmentSplit.pickup;
  const deliveryShare = totalWeek ? Math.round((fulfillmentSplit.delivery / totalWeek) * 100) : 0;

  return (
    <section aria-labelledby="tally-title" className="ticket bg-surface px-6 py-7 shadow-lift">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 id="tally-title" className="display text-3xl">
          {t.dashboard.overview.tallyTitle}
        </h2>
        <span className="font-mono text-xs text-muted">{fill(t.dashboard.overview.asOf, { time: formatTime(overview.generatedAt) })}</span>
      </div>

      <dl className="mt-5 flex flex-col gap-3 text-[15px]">
        <Line label={t.dashboard.overview.revenue}>{formatMoney(today.revenue)}</Line>
        <Line label={t.dashboard.overview.orders}>{formatNumber(today.orders)}</Line>
        <Line label={t.dashboard.overview.averageOrder}>{formatMoney(today.averageOrder)}</Line>
        <Line label={t.dashboard.overview.openNow}>{formatNumber(overview.openOrders)}</Line>
      </dl>

      <p className="mt-5 border-t border-dashed border-line-strong pt-4 text-sm">
        <Change today={today.revenue} yesterday={yesterday.revenue} />
      </p>

      <div className="mt-4 border-t border-dashed border-line-strong pt-4">
        <p className="text-sm font-semibold">{t.dashboard.overview.splitTitle}</p>
        {totalWeek ? (
          <>
            <div className="mt-3 flex h-2.5 gap-[2px]" aria-hidden>
              <span className="rounded-s-[4px] bg-ink" style={{ width: `${deliveryShare}%` }} />
              <span className="rounded-e-[4px] bg-tomato" style={{ width: `${100 - deliveryShare}%` }} />
            </div>
            <ul className="mt-2 flex justify-between text-sm">
              <li className="flex items-center gap-2">
                <span className="size-2.5 rounded-sm bg-ink" aria-hidden />
                {t.common.delivery} <span className="font-mono font-semibold">{formatPercent(deliveryShare)}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="size-2.5 rounded-sm bg-tomato" aria-hidden />
                {t.common.pickup} <span className="font-mono font-semibold">{formatPercent(100 - deliveryShare)}</span>
              </li>
            </ul>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted">{t.dashboard.overview.noWeek}</p>
        )}
      </div>
    </section>
  );
}
