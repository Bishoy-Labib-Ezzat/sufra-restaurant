import { fill, t } from '@/shared/i18n';
import { formatDateTime } from '@/shared/lib/format';
import { formatOrderCode } from '@/shared/lib/order-status';
import { restaurant } from '@/shared/config/restaurant';
import { Price } from '@/shared/ui/Price';
import type { OrderTracking } from '@/shared/types';

/** The customer's copy of the kitchen ticket: same object the staff sees on their board. */
export function ReceiptTicket({ tracking }: { tracking: OrderTracking }) {
  return (
    <div className="ticket bg-surface px-6 py-8 shadow-lift sm:px-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{t.shop.order.receiptNumber}</p>
          <p className="display text-5xl">{formatOrderCode(tracking.code)}</p>
        </div>
        <p className="pt-1 text-end font-mono text-sm text-muted">{formatDateTime(tracking.createdAt)}</p>
      </div>

      <ul className="mt-6 flex flex-col gap-3 border-t border-dashed border-line-strong pt-5">
        {tracking.items.map((item) => (
          <li key={item.productId} className="flex items-baseline gap-3 text-[15px]">
            <span className="w-7 shrink-0 font-mono font-semibold text-tomato-deep">{fill(t.units.quantity, { count: item.quantity })}</span>
            <span className="min-w-0 flex-1">{item.name}</span>
            <Price amount={item.lineTotal} className="text-sm" />
          </li>
        ))}
      </ul>

      <dl className="mt-5 flex flex-col gap-2 border-t border-dashed border-line-strong pt-5 text-[15px]">
        <div className="flex justify-between">
          <dt className="text-muted">{t.common.subtotal}</dt>
          <dd>
            <Price amount={tracking.subtotal} className="text-sm" />
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted">
            {tracking.fulfillment === 'delivery' ? fill(t.shop.checkout.deliveryTo, { zone: tracking.zoneName ?? '' }) : t.common.pickup}
          </dt>
          <dd>{tracking.deliveryFee ? <Price amount={tracking.deliveryFee} className="text-sm" /> : <span className="font-mono text-sm">{t.common.free}</span>}</dd>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <dt className="font-semibold">
            {tracking.fulfillment === 'delivery' ? t.shop.order.totalOnDelivery : t.shop.order.totalAtPickup}
          </dt>
          <dd>
            <Price amount={tracking.total} strong className="text-xl" />
          </dd>
        </div>
      </dl>

      {tracking.fulfillment === 'pickup' && (
        <p className="mt-5 border-t border-dashed border-line-strong pt-5 text-sm text-muted">
          {fill(t.shop.order.pickupFrom, { address: restaurant.address })}
        </p>
      )}
    </div>
  );
}
