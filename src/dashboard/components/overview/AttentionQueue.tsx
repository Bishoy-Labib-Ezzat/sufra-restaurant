import { Link, useNavigate } from 'react-router';
import { Confetti, Moped, Storefront } from '@phosphor-icons/react';
import { formatElapsed, minutesSince, pluralize } from '@/shared/lib/format';
import { advanceLabel, nextStatus } from '@/shared/lib/order-status';
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
      title="Needs you now"
      aside={waiting.length > LIMIT && <Link to="/dashboard/orders" className="font-semibold text-ink underline underline-offset-4">All {waiting.length}</Link>}
    >
      {waiting.length === 0 ? (
        <EmptyState
          className="py-8"
          icon={Confetti}
          title="All caught up"
          description="Every order has been confirmed. New ones will show up here and ping you."
        />
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          {waiting.slice(0, LIMIT).map((order) => {
            const late = minutesSince(order.createdAt, now) >= 8;
            const next = nextStatus(order.status);
            return (
              <li key={order.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 first:pt-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span className="shrink-0 font-mono text-[15px] font-bold whitespace-nowrap">{order.code}</span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{order.customer.name}</span>
                    <span className="flex items-center gap-1.5 text-sm text-muted">
                      {order.fulfillment === 'delivery' ? <Moped size={14} weight="bold" aria-hidden /> : <Storefront size={14} weight="bold" aria-hidden />}
                      {order.address?.zoneName ?? 'Pickup'}, {pluralize(order.items.reduce((sum, item) => sum + item.quantity, 0), 'item')}
                    </span>
                  </span>
                </button>
                <StatusBadge status={order.status} className="hidden sm:inline-flex" />
                <span
                  className={cn('rounded-full px-2 py-0.5 font-mono text-xs font-semibold', late ? 'bg-tomato text-white' : 'bg-paper-deep text-ink-soft')}
                >
                  {formatElapsed(order.createdAt, now)}
                </span>
                <Price amount={order.total} className="w-24 text-right text-sm" />
                {next && (
                  <Button
                    size="sm"
                    variant={order.status === 'new' ? 'primary' : 'ink'}
                    loading={updateStatus.isPending && updateStatus.variables?.order.id === order.id}
                    onClick={() => updateStatus.mutate({ order, status: next })}
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
