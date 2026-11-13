import { Link } from 'react-router';
import { ArrowRight } from '@phosphor-icons/react';
import { useAuth } from '@/shared/auth/auth-context';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useNow } from '@/shared/hooks/useNow';
import { firstName, formatFullDate, formatMoney, formatWeekday, isSameDay, pluralize } from '@/shared/lib/format';
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

function greeting(date: Date) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const compact = (value: number) => (value >= 1000 ? `${Math.round(value / 100) / 10}K` : String(value));
const hourLabel = (hour: number) => (hour === 0 ? '12a' : hour === 12 ? '12p' : hour > 12 ? `${hour - 12}p` : `${hour}a`);

export function OverviewPage() {
  useDocumentTitle('Overview');
  const { user } = useAuth();
  const now = useNow(30_000);
  const overview = useOverview();
  const open = useOrdersList({ status: OPEN_STATUSES, pageSize: 200 });
  const today = new Date(now);

  return (
    <>
      <PageHeader
        title={`${greeting(today)}, ${firstName(user?.name ?? '')}`}
        description={formatFullDate(today)}
        actions={
          <Link to="/dashboard/orders" className={buttonStyles({ variant: 'ink' })}>
            Open the board
            <ArrowRight size={16} weight="bold" aria-hidden />
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
                title="Revenue, last 7 days"
                aside={`${formatMoney(overview.data.revenueByDay.reduce((sum, day) => sum + day.revenue, 0))} in total`}
              >
                <ColumnChart
                  caption="Revenue per day for the last 7 days, in Egyptian pounds"
                  highlightKey={overview.data.revenueByDay.at(-1)?.date}
                  formatValue={formatMoney}
                  formatTick={compact}
                  data={overview.data.revenueByDay.map((day) => {
                    const date = new Date(`${day.date}T12:00:00`);
                    const isToday = isSameDay(date, today);
                    return {
                      key: day.date,
                      label: isToday ? 'Today' : formatWeekday(date.toISOString()),
                      longLabel: isToday ? 'Today' : formatFullDate(date),
                      value: day.revenue,
                      detail: pluralize(day.orders, 'order'),
                    };
                  })}
                />
              </Panel>
              <Panel title="Best sellers" aside="Last 7 days">
                <BestSellers items={overview.data.topProducts} />
              </Panel>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <Panel title="Orders by hour" aside="Today">
                <ColumnChart
                  caption="Orders placed today, per hour of service"
                  integer
                  height={160}
                  highlightKey={String(today.getHours())}
                  formatValue={(value) => pluralize(value, 'order')}
                  formatTick={String}
                  data={SERVICE_HOURS.map((hour) => ({
                    key: String(hour),
                    label: hourLabel(hour),
                    longLabel: `${hourLabel(hour).replace('a', ' AM').replace('p', ' PM')} to ${hourLabel((hour + 1) % 24).replace('a', ' AM').replace('p', ' PM')}`,
                    value: overview.data.ordersByHour.find((entry) => entry.hour === hour)?.orders ?? 0,
                  }))}
                />
              </Panel>
              <Panel title="Today by status">
                <StatusMix breakdown={overview.data.statusBreakdown} />
              </Panel>
            </div>
          </>
        )}
      </div>
    </>
  );
}
