import { useState } from 'react';
import { AnimatePresence, LayoutGroup } from 'motion/react';
import { CheckCircle } from '@phosphor-icons/react';
import { useNow } from '@/shared/hooks/useNow';
import { nextStatus, OPEN_STATUSES, STATUS_META } from '@/shared/lib/order-status';
import { cn } from '@/shared/lib/cn';
import { Segmented } from '@/shared/ui/form';
import type { Order, OrderStatus } from '@/shared/types';
import { useUpdateOrderStatus } from '../../hooks/orders';
import { OrderTicket } from './OrderTicket';

const LANE_HINT: Partial<Record<OrderStatus, string>> = {
  new: 'Waiting for someone to pick them up',
  reviewing: 'Call the customer to confirm',
  confirmed: 'Confirmed on the phone',
  preparing: 'On the grill',
  ready: 'Waiting for a rider or the customer',
};

interface OrderBoardProps {
  orders: Order[];
  onOpen: (order: Order) => void;
}

/** Open orders as tickets on a rail, one lane per status, oldest first. */
export function OrderBoard({ orders, onOpen }: OrderBoardProps) {
  const now = useNow(20_000);
  const updateStatus = useUpdateOrderStatus();
  const [mobileLane, setMobileLane] = useState<OrderStatus>('new');

  const lanes = OPEN_STATUSES.map((status) => ({
    status,
    orders: orders
      .filter((order) => order.status === status)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  }));

  const advance = (order: Order) => {
    const next = nextStatus(order.status);
    if (next) updateStatus.mutate({ order, status: next });
  };

  return (
    <LayoutGroup>
      <Segmented<OrderStatus>
        className="scrollbar-none mb-4 flex max-w-full overflow-x-auto md:hidden"
        size="sm"
        label="Lane"
        value={mobileLane}
        onChange={setMobileLane}
        options={lanes.map(({ status, orders: laneOrders }) => ({
          value: status,
          label: (
            <>
              {STATUS_META[status].label}
              <span className="font-mono text-xs opacity-70">{laneOrders.length}</span>
            </>
          ),
        }))}
      />

      <div className="grid gap-4 md:auto-cols-[minmax(260px,1fr)] md:grid-flow-col md:overflow-x-auto md:pb-4">
        {lanes.map(({ status, orders: laneOrders }) => (
          <section
            key={status}
            aria-labelledby={`lane-${status}`}
            className={cn('flex-col gap-3 rounded-panel bg-paper-deep/70 p-3', status === mobileLane ? 'flex' : 'hidden md:flex')}
          >
            <header className="flex items-center justify-between px-1 pt-1">
              <div className="flex items-center gap-2">
                <span className={cn('size-2.5 rounded-full', STATUS_META[status].tone.marker)} aria-hidden />
                <h2 id={`lane-${status}`} className="font-display text-lg font-bold">
                  {STATUS_META[status].label}
                </h2>
              </div>
              <span className="font-mono text-sm font-semibold text-ink-soft">{laneOrders.length}</span>
            </header>
            <p className="-mt-2 px-1 text-xs text-muted">{LANE_HINT[status]}</p>

            <div className="flex min-h-24 flex-col gap-3">
              <AnimatePresence mode="popLayout" initial={false}>
                {laneOrders.map((order) => (
                  <OrderTicket
                    key={order.id}
                    order={order}
                    now={now}
                    onOpen={onOpen}
                    onAdvance={advance}
                    advancing={updateStatus.isPending && updateStatus.variables?.order.id === order.id}
                  />
                ))}
              </AnimatePresence>
              {laneOrders.length === 0 && (
                <p className="flex flex-1 flex-col items-center justify-center gap-1 rounded-field border border-dashed border-line-strong px-3 py-8 text-center text-sm text-muted">
                  <CheckCircle size={20} weight="bold" aria-hidden />
                  Nothing here
                </p>
              )}
            </div>
          </section>
        ))}
      </div>
    </LayoutGroup>
  );
}
