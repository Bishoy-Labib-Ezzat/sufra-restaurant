import { Copy, MapPin, Moped, Notepad, Phone, Storefront, X } from '@phosphor-icons/react';
import { fill, formatNumber, t, toArabicDigits } from '@/shared/i18n';
import { formatDateTime } from '@/shared/lib/format';
import { formatOrderCode } from '@/shared/lib/order-status';
import { photo } from '@/shared/lib/image';
import { formatPhone } from '@/shared/lib/phone';
import { IconButton } from '@/shared/ui/Button';
import { Price } from '@/shared/ui/Price';
import { ErrorState, Skeleton } from '@/shared/ui/states';
import { toast } from '@/shared/ui/toast-store';
import type { Order } from '@/shared/types';
import { useOrder } from '../../hooks/orders';
import { StatusBadge } from '../StatusBadge';
import { OrderTimeline } from './OrderTimeline';
import { StatusActions } from './StatusActions';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-t border-line px-6 py-5">
      <h3 className="text-sm font-semibold text-muted">{title}</h3>
      {children}
    </section>
  );
}

function OrderDetails({ order }: { order: Order }) {
  const copyPhone = () =>
    navigator.clipboard
      .writeText(order.customer.phone)
      .then(() => toast.success(t.dashboard.orders.phoneCopied))
      .catch(() => toast.error(t.common.copyBlocked));

  return (
    <>
      <div className="px-6 pb-5">
        <StatusActions order={order} />
      </div>

      <Section title={t.dashboard.orders.customer}>
        <p className="text-lg font-semibold">{order.customer.name}</p>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`tel:${order.customer.phone}`}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 font-mono text-sm font-semibold text-paper hover:bg-forest-soft"
          >
            <Phone size={16} weight="bold" aria-hidden />
            <span className="digits-ltr">{formatPhone(order.customer.phone)}</span>
          </a>
          <IconButton icon={Copy} label={t.dashboard.orders.copyPhone} variant="secondary" size="sm" onClick={copyPhone} />
        </div>
      </Section>

      <Section title={order.fulfillment === 'delivery' ? t.common.delivery : t.common.pickup}>
        {order.address ? (
          <div className="flex gap-3 text-[15px]">
            <Moped size={20} weight="bold" className="mt-0.5 shrink-0 text-tomato-deep" aria-hidden />
            <div className="flex flex-col gap-0.5">
              <p className="font-semibold">{order.address.zoneName}</p>
              <p>{toArabicDigits(order.address.street)}</p>
              {order.address.details && <p className="text-ink-soft">{toArabicDigits(order.address.details)}</p>}
              {order.address.landmark && (
                <p className="inline-flex items-center gap-1 text-muted">
                  <MapPin size={14} weight="bold" aria-hidden />
                  {toArabicDigits(order.address.landmark)}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="flex items-center gap-3 text-[15px]">
            <Storefront size={20} weight="bold" className="text-tomato-deep" aria-hidden />
            {t.dashboard.orders.collectsAtCounter}
          </p>
        )}
      </Section>

      {order.notes && (
        <Section title={t.dashboard.orders.customerNotes}>
          <p className="flex gap-2 rounded-field bg-status-new-wash px-4 py-3 text-[15px] text-status-new-ink">
            <Notepad size={18} weight="bold" className="mt-0.5 shrink-0" aria-hidden />
            {toArabicDigits(order.notes)}
          </p>
        </Section>
      )}

      <Section title={fill(t.dashboard.orders.itemsCount, { count: order.items.reduce((sum, item) => sum + item.quantity, 0) })}>
        <ul className="flex flex-col gap-3">
          {order.items.map((item) => (
            <li key={item.productId} className="flex items-center gap-3">
              <img src={photo(item.imageUrl, 96, 96)} alt="" className="size-11 rounded-thumb object-cover" />
              <span className="w-8 font-mono font-semibold text-tomato-deep">{fill(t.units.quantity, { count: item.quantity })}</span>
              <span className="min-w-0 flex-1 truncate text-[15px]">{item.name}</span>
              <Price amount={item.lineTotal} className="text-sm" />
            </li>
          ))}
        </ul>
        <dl className="mt-2 flex flex-col gap-1.5 border-t border-dashed border-line-strong pt-4 text-[15px]">
          <div className="flex justify-between">
            <dt className="text-muted">{t.common.subtotal}</dt>
            <dd><Price amount={order.subtotal} className="text-sm" /></dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">{t.common.deliveryFee}</dt>
            <dd>{order.deliveryFee ? <Price amount={order.deliveryFee} className="text-sm" /> : <span className="font-mono text-sm">{formatNumber(0)}</span>}</dd>
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <dt className="font-semibold">{t.dashboard.orders.toCollect}</dt>
            <dd><Price amount={order.total} strong className="text-xl" /></dd>
          </div>
        </dl>
      </Section>

      <Section title={t.dashboard.orders.history}>
        <OrderTimeline history={order.history} />
      </Section>
    </>
  );
}

export function OrderPanel({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const { data: order, error, isPending, refetch, isFetching } = useOrder(orderId);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4">
        <div className="flex min-w-0 flex-col gap-2">
          {order ? (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="display text-4xl">{formatOrderCode(order.code)}</h2>
                <StatusBadge status={order.status} />
              </div>
              <p className="text-sm text-muted">{fill(t.dashboard.orders.placedAt, { time: formatDateTime(order.createdAt) })}</p>
            </>
          ) : (
            <Skeleton className="h-10 w-40" />
          )}
        </div>
        <IconButton icon={X} label={t.common.close} onClick={onClose} className="-me-2" />
      </div>
      <div className="flex-1 overflow-y-auto">
        {order ? (
          <OrderDetails order={order} />
        ) : isPending ? (
          <div className="flex flex-col gap-4 px-6" role="status" aria-label={t.dashboard.orders.loadingOrder}>
            <Skeleton className="h-11 w-56 rounded-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="px-6">
            <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} compact />
          </div>
        )}
      </div>
    </div>
  );
}
