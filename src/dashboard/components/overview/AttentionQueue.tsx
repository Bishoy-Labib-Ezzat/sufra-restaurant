import { Link, useNavigate } from 'react-router';
import { Confetti, Moped, Storefront } from '@phosphor-icons/react';
import { fill, plural, t } from '@/shared/i18n';
import { formatElapsed, minutesSince } from '@/shared/lib/format';
import { advanceLabel, formatOrderCode, nextStatus } from '@/shared/lib/order-status';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Price } from '@/shared/ui/Price';
import type { Order } from '@/shared/types';
import { useUpdateOrderStatus } from '../../hooks/orders';
import { StatusBadge } from '../StatusBadge';
import { Panel } from '../PageHeader';

const LIMIT = 6;

/** Orders waiting on a person: new ones to pick up and ones still to be confirmed by phone. */
export function AttentionQueue({ orders, now }: { orders: Order[]; now: number }) {
  const navigate = useNavigate();
  const updateStatus = useUpdateOrderStatus();
  const waiting = orders
    .filter((order) => order.status === 'new' || order.status === 'reviewing')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return (
    <Panel
      title={t.dashboard.overview.attentionTitle}
      aside={waiting.length > LIMIT && <Link to="/dashboard/orders" className="font-semibold text-ink underline underline-offset-4">{fill(t.dashboard.overview.attentionAll, { count: waiting.length })}</Link>}
    >
      {waiting.length === 0 ? (
        <EmptyState
          className="py-8"
          icon={Confetti}
          title={t.dashboard.overview.caughtUpTitle}
          description={t.dashboard.overview.caughtUpBody}
        />
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          {waiting.slice(0, LIMIT).map((order) => {
            const late = minutesSince(order.createdAt, now) >= 8;
            const next = nextStatus(order.status);
            return (
              // Phones: a 2x2 card (details | wait time, total | action). Wider: one line.
              <li
                key={order.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 py-3 first:pt-0 last:pb-0 sm:flex sm:gap-4"
              >
                <button
                  type="button"
                  onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                  className="col-start-1 row-start-1 flex min-h-11 min-w-0 flex-col items-start text-start sm:flex-1 sm:flex-row sm:items-center sm:gap-3"
                >
                  <span className="shrink-0 font-mono text-[15px] font-bold whitespace-nowrap">{formatOrderCode(order.code)}</span>
                  <span className="min-w-0 max-w-full">
                    <span className="block truncate font-semibold">{order.customer.name}</span>
                    <span className="flex items-center gap-1.5 text-sm text-muted">
                      {order.fulfillment === 'delivery' ? <Moped size={14} weight="bold" aria-hidden /> : <Storefront size={14} weight="bold" aria-hidden />}
                      <span className="truncate">
                        {fill(t.dashboard.overview.orderSummary, {
                          place: order.address?.zoneName ?? t.common.pickup,
                          items: plural(t.plurals.items, order.items.reduce((sum, item) => sum + item.quantity, 0)),
                        })}
                      </span>
                    </span>
                  </span>
                </button>
                <StatusBadge status={order.status} className="hidden md:inline-flex" />
                <span
                  className={cn(
                    'col-start-2 row-start-1 self-start justify-self-end rounded-full px-2 py-0.5 font-mono text-xs font-semibold whitespace-nowrap sm:self-center',
                    late ? 'bg-tomato text-white' : 'bg-paper-deep text-ink-soft',
                  )}
                >
                  {formatElapsed(order.createdAt, now)}
                </span>
                <Price amount={order.total} className="col-start-1 row-start-2 text-sm sm:w-24 sm:justify-end" />
                {next && (
                  <Button
                    size="sm"
                    variant={order.status === 'new' ? 'primary' : 'ink'}
                    loading={updateStatus.isPending && updateStatus.variables?.order.id === order.id}
                    onClick={() => updateStatus.mutate({ order, status: next })}
                    className="col-start-2 row-start-2"
                  >
                    {advanceLabel(order.status, order.fulfillment)}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
