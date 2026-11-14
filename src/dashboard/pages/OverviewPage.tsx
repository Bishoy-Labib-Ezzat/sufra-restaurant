import { Link } from 'react-router';
import { ArrowLeft } from '@phosphor-icons/react';
import { useAuth } from '@/shared/auth/auth-context';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useNow } from '@/shared/hooks/useNow';
import { fill, plural, t } from '@/shared/i18n';
import { firstName, formatCompact, formatFullDate, formatHour, formatMoney, formatWeekday, isSameDay } from '@/shared/lib/format';
import { OPEN_STATUSES } from '@/shared/lib/order-status';
import { buttonStyles } from '@/shared/ui/button-styles';
import { ErrorState, Skeleton } from '@/shared/ui/states';
import { AttentionQueue } from '../components/overview/AttentionQueue';
import { ColumnChart } from '../components/overview/ColumnChart';
import { PassStrip } from '../components/overview/PassStrip';
import { BestSellers, StatusMix } from '../components/overview/RankedLists';
import { TodayTally } from '../components/overview/TodayTally';
import { PageHeader, Panel } from '../components/PageHeader';
import { useOrdersList } from '../hooks/orders';
import { useOverview } from '../hooks/stats';

const SERVICE_HOURS = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0];

/** Arabic greets with "good morning" until noon and "good evening" after. */
function greeting(date: Date) {
  const hour = date.getHours();
  return hour >= 5 && hour < 12 ? t.dashboard.overview.morning : t.dashboard.overview.evening;
}

export function OverviewPage() {
  useDocumentTitle(t.dashboard.overview.title);
  const { user } = useAuth();
  const now = useNow(30_000);
  const overview = useOverview();
  const open = useOrdersList({ status: OPEN_STATUSES, pageSize: 200 });
  const today = new Date(now);

  return (
    <>
      <PageHeader
        title={fill(t.dashboard.overview.greeting, { greeting: greeting(today), name: firstName(user?.name ?? '') })}
        description={formatFullDate(today)}
        actions={
          <Link to="/dashboard/orders" className={buttonStyles({ variant: 'ink' })}>
            {t.dashboard.overview.openBoard}
            <ArrowLeft size={16} weight="bold" aria-hidden />
          </Link>
        }
      />

      <div className="flex flex-col gap-5">
        {open.isPending ? (
          <Skeleton className="h-36 w-full rounded-panel" />
        ) : open.error ? (
          <ErrorState error={open.error} onRetry={() => open.refetch()} retrying={open.isFetching} compact />
        ) : (
          <PassStrip orders={open.data.items} now={now} />
        )}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          {open.data ? <AttentionQueue orders={open.data.items} now={now} /> : <Skeleton className="h-72 rounded-panel" />}
          {overview.data ? (
            <TodayTally overview={overview.data} />
          ) : overview.error ? (
            <ErrorState error={overview.error} onRetry={() => overview.refetch()} retrying={overview.isFetching} compact />
          ) : (
            <Skeleton className="h-80 rounded-panel" />
          )}
        </div>

        {overview.data && (
          <>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
              <Panel
                title={t.dashboard.overview.revenueTitle}
                aside={fill(t.dashboard.overview.revenueTotal, {
                  amount: formatMoney(overview.data.revenueByDay.reduce((sum, day) => sum + day.revenue, 0)),
                })}
              >
                <ColumnChart
                  caption={t.dashboard.overview.revenueCaption}
                  highlightKey={overview.data.revenueByDay.at(-1)?.date}
                  formatValue={formatMoney}
                  formatTick={formatCompact}
                  data={overview.data.revenueByDay.map((day) => {
                    const date = new Date(`${day.date}T12:00:00`);
                    const isToday = isSameDay(date, today);
                    return {
                      key: day.date,
                      label: isToday ? t.time.today : formatWeekday(date.toISOString()),
                      longLabel: isToday ? t.time.today : formatFullDate(date),
                      value: day.revenue,
                      detail: plural(t.plurals.orders, day.orders),
                    };
                  })}
                />
              </Panel>
              <Panel title={t.dashboard.overview.bestSellers} aside={t.dashboard.overview.last7}>
                <BestSellers items={overview.data.topProducts} />
              </Panel>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <Panel title={t.dashboard.overview.byHour} aside={t.time.today}>
                <ColumnChart
                  caption={t.dashboard.overview.byHourCaption}
                  integer
                  height={160}
                  highlightKey={String(today.getHours())}
                  formatValue={(value) => plural(t.plurals.orders, value)}
                  formatTick={formatCompact}
                  data={SERVICE_HOURS.map((hour) => ({
                    key: String(hour),
                    label: formatHour(hour),
                    longLabel: fill(t.time.hourRange, { from: formatHour(hour), to: formatHour(hour + 1) }),
                    value: overview.data.ordersByHour.find((entry) => entry.hour === hour)?.orders ?? 0,
                  }))}
                />
              </Panel>
              <Panel title={t.dashboard.overview.byStatus}>
                <StatusMix breakdown={overview.data.statusBreakdown} />
              </Panel>
            </div>
          </>
        )}
      </div>
    </>
  );
}
