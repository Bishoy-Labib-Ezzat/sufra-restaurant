import { restaurant } from '@/shared/config/restaurant';
import { fill, plural, t } from '@/shared/i18n';
import { formatMoney } from '@/shared/lib/format';
import type { OrderTotals } from '@/shared/lib/pricing';
import { Button } from '@/shared/ui/Button';
import { Price } from '@/shared/ui/Price';
import type { DeliveryZone, FulfillmentType } from '@/shared/types';
import type { CartLine } from '../../hooks/useCart';
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
        <h2 className="display text-4xl">{t.shop.checkout.summaryTitle}</h2>
        <span className="font-mono text-sm text-muted">{plural(t.plurals.items, totals.itemCount)}</span>
      </div>

      <ul className="mt-4 divide-y divide-line">
        {lines.map((line) => (
          <CartLineRow key={line.productId} line={line} unavailable={unavailableIds.has(line.productId)} compact />
        ))}
      </ul>

      <dl className="mt-4 flex flex-col gap-2 border-t border-dashed border-line-strong pt-5 text-[15px]">
        <div className="flex justify-between">
          <dt className="text-muted">{t.common.subtotal}</dt>
          <dd>
            <Price amount={totals.subtotal} className="text-sm" />
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">
            {fulfillment === 'pickup' ? t.common.pickup : zone ? fill(t.shop.checkout.deliveryTo, { zone: zone.name }) : t.common.delivery}
          </dt>
          <dd className="text-end">
            {fulfillment === 'pickup' ? (
              <span className="font-mono text-sm">{t.common.free}</span>
            ) : zone ? (
              <Price amount={zone.fee} className="text-sm" />
            ) : (
              <span className="text-sm text-muted">{t.shop.checkout.chooseArea}</span>
            )}
          </dd>
        </div>
        <div className="mt-2 flex items-baseline justify-between border-t border-line pt-4">
          <dt className="font-semibold">{t.common.total}</dt>
          <dd>
            <Price amount={totals.total} strong className="text-2xl" />
          </dd>
        </div>
      </dl>

      {/* Phones and tablets submit from the sticky bar instead (MobileCheckoutBar). */}
      <Button type="submit" size="lg" block loading={submitting} className="mt-6 hidden lg:flex">
        {submitting
          ? t.shop.checkout.placing
          : needsZone
            ? t.shop.checkout.placeOrder
            : fill(t.shop.checkout.placeOrderFor, { price: formatMoney(totals.total) })}
      </Button>
      <p className="mt-3 text-center text-sm text-muted">
        {fill(t.shop.checkout.summaryNote, {
          minutes: plural(t.plurals.minutes, restaurant.confirmationCallMinutes),
          how: fulfillment === 'delivery' ? t.shop.checkout.payOnDelivery : t.shop.checkout.payAtCounter,
        })}
      </p>
    </div>
  );
}
