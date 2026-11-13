import { restaurant } from '@/shared/config/restaurant';
import { formatMoney, pluralize } from '@/shared/lib/format';
import type { OrderTotals } from '@/shared/lib/pricing';
import { Button } from '@/shared/ui/Button';
import { Price } from '@/shared/ui/Price';
import type { DeliveryZone, FulfillmentType } from '@/shared/types';
import type { CartLine } from '../../store/cart.store';
import { CartLineRow } from '../cart/CartLineRow';

interface OrderSummaryProps {
  lines: CartLine[];
  unavailableIds: Set<string>;
  totals: OrderTotals;
  fulfillment: FulfillmentType;
  zone: DeliveryZone | undefined;
  submitting: boolean;
}

export function OrderSummary({ lines, unavailableIds, totals, fulfillment, zone, submitting }: OrderSummaryProps) {
  const needsZone = fulfillment === 'delivery' && !zone;

  return (
    <div className="ticket bg-surface px-6 py-8 shadow-lift">
      <div className="flex items-baseline justify-between">
        <h2 className="display text-4xl">Your order</h2>
        <span className="font-mono text-sm text-muted">{pluralize(totals.itemCount, 'item')}</span>
      </div>

      <ul className="mt-4 divide-y divide-line">
        {lines.map((line) => (
          <CartLineRow key={line.productId} line={line} unavailable={unavailableIds.has(line.productId)} compact />
        ))}
      </ul>

      <dl className="mt-4 flex flex-col gap-2 border-t border-dashed border-line-strong pt-5 text-[15px]">
        <div className="flex justify-between">
          <dt className="text-muted">Subtotal</dt>
          <dd>
            <Price amount={totals.subtotal} className="text-sm" />
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">{fulfillment === 'pickup' ? 'Pickup' : zone ? `Delivery to ${zone.name}` : 'Delivery'}</dt>
          <dd className="text-right">
            {fulfillment === 'pickup' ? (
              <span className="font-mono text-sm">Free</span>
            ) : zone ? (
              <Price amount={zone.fee} className="text-sm" />
            ) : (
              <span className="text-sm text-muted">Choose your area</span>
            )}
          </dd>
        </div>
        <div className="mt-2 flex items-baseline justify-between border-t border-line pt-4">
          <dt className="font-semibold">Total</dt>
          <dd>
            <Price amount={totals.total} strong className="text-2xl" />
          </dd>
        </div>
      </dl>

      <Button type="submit" size="lg" block loading={submitting} className="mt-6">
        {submitting ? 'Placing your order' : needsZone ? 'Place order' : `Place order · ${formatMoney(totals.total)}`}
      </Button>
      <p className="mt-3 text-center text-sm text-muted">
        Nothing is charged online. We call within {restaurant.confirmationCallMinutes} minutes to confirm, then you pay{' '}
        {fulfillment === 'delivery' ? 'cash on delivery' : 'at the counter'}.
      </p>
    </div>
  );
}
