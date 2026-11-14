import { motion } from 'motion/react';
import { Moped, Notepad, Storefront } from '@phosphor-icons/react';
import { fill, t, toArabicDigits } from '@/shared/i18n';
import { formatElapsed, minutesSince } from '@/shared/lib/format';
import { advanceLabel, formatOrderCode, nextStatus } from '@/shared/lib/order-status';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';
import { Price } from '@/shared/ui/Price';
import type { Order } from '@/shared/types';

/** Minutes an order may sit in a status before it is flagged as waiting too long. */
const PATIENCE: Partial<Record<Order['status'], number>> = { new: 5, reviewing: 10, confirmed: 10, preparing: 30, ready: 20 };

interface OrderTicketProps {
  order: Order;
  now: number;
  onOpen: (order: Order) => void;
  onAdvance: (order: Order) => void;
  advancing: boolean;
}

/** Kitchen ticket. The same perforated object the customer sees as their receipt. */
export function OrderTicket({ order, now, onOpen, onAdvance, advancing }: OrderTicketProps) {
  const since = order.history.findLast((entry) => entry.status === order.status)?.at ?? order.updatedAt;
  const late = minutesSince(since, now) >= (PATIENCE[order.status] ?? Infinity);
  const action = advanceLabel(order.status, order.fulfillment);
  const visibleItems = order.items.slice(0, 3);
  const hiddenCount = order.items.length - visibleItems.length;

  return (
    <motion.article
      layout
      layoutId={order.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
      className="group relative"
    >
      <div className="ticket-top flex flex-col gap-3 bg-surface px-4 pt-5 pb-4 shadow-lift">
        <div className="flex items-start justify-between gap-2">
          <h3>
            <button
              type="button"
              onClick={() => onOpen(order)}
              className="font-mono text-[15px] font-bold tracking-tight after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
            >
              {formatOrderCode(order.code)}
            </button>
          </h3>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 font-mono text-xs font-semibold tabular',
              late ? 'bg-tomato text-white' : 'bg-paper-deep text-ink-soft',
            )}
            title={late ? t.dashboard.orders.late : undefined}
          >
            {formatElapsed(since, now)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          {order.fulfillment === 'delivery' ? (
            <Moped size={16} weight="bold" className="shrink-0 text-ink-soft" aria-label={t.common.delivery} />
          ) : (
            <Storefront size={16} weight="bold" className="shrink-0 text-ink-soft" aria-label={t.common.pickup} />
          )}
          <span className="truncate font-semibold">{order.customer.name}</span>
          <span className="truncate text-muted">{order.address?.zoneName ?? t.common.pickup}</span>
        </div>

        <ul className="flex flex-col gap-1 border-t border-dashed border-line-strong pt-3 text-sm">
          {visibleItems.map((item) => (
            <li key={item.productId} className="flex gap-2">
              <span className="w-6 shrink-0 font-mono font-semibold text-tomato-deep">{fill(t.units.quantity, { count: item.quantity })}</span>
              <span className="truncate">{item.name}</span>
            </li>
          ))}
          {hiddenCount > 0 && <li className="ps-8 text-muted">{fill(t.dashboard.orders.moreItems, { count: hiddenCount })}</li>}
        </ul>

        {order.notes && (
          <p className="flex gap-2 rounded-field bg-status-new-wash px-3 py-2 text-xs text-status-new-ink">
            <Notepad size={14} weight="bold" className="mt-px shrink-0" aria-hidden />
            <span className="line-clamp-2">{toArabicDigits(order.notes)}</span>
          </p>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          <Price amount={order.total} strong className="text-[15px]" />
          {action && nextStatus(order.status) && (
            <Button
              size="sm"
              variant={order.status === 'new' ? 'primary' : 'ink'}
              loading={advancing}
              onClick={() => onAdvance(order)}
              className="relative z-10"
            >
              {action}
            </Button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
