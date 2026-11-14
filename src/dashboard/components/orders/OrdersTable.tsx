import { Moped, Storefront } from '@phosphor-icons/react';
import { formatNumber, plural, t } from '@/shared/i18n';
import { formatDateTime } from '@/shared/lib/format';
import { formatOrderCode } from '@/shared/lib/order-status';
import { formatPhone } from '@/shared/lib/phone';
import { Price } from '@/shared/ui/Price';
import type { Order } from '@/shared/types';
import { StatusBadge } from '../StatusBadge';

const itemCount = (order: Order) => order.items.reduce((sum, item) => sum + item.quantity, 0);

/** Phones: each order is one tappable card. */
function OrderCards({ orders, onOpen }: { orders: Order[]; onOpen: (order: Order) => void }) {
  return (
    <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-panel bg-surface ring-1 ring-line md:hidden">
      {orders.map((order) => (
        <li key={order.id}>
          <button
            type="button"
            onClick={() => onOpen(order)}
            className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 px-4 py-3.5 text-start transition-colors active:bg-paper"
          >
            <span className="flex min-w-0 items-baseline gap-2">
              <span className="font-mono font-bold whitespace-nowrap">{formatOrderCode(order.code)}</span>
              <span className="truncate text-sm text-muted">{formatDateTime(order.createdAt)}</span>
            </span>
            <StatusBadge status={order.status} className="justify-self-end" />
            <span className="truncate font-semibold">{order.customer.name}</span>
            <Price amount={order.total} className="justify-self-end text-[15px]" />
            <span className="col-span-2 flex items-center gap-1.5 text-sm text-muted">
              {order.fulfillment === 'delivery' ? <Moped size={14} weight="bold" aria-hidden /> : <Storefront size={14} weight="bold" aria-hidden />}
              <span className="truncate">
                {order.address?.zoneName ?? t.common.pickup}، {plural(t.plurals.items, itemCount(order))}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function OrdersTable({ orders, onOpen }: { orders: Order[]; onOpen: (order: Order) => void }) {
  return (
    <>
      <OrderCards orders={orders} onOpen={onOpen} />
      <div className="relative hidden overflow-hidden rounded-panel bg-surface ring-1 ring-line md:block">
        <table className="w-full text-start text-[15px]">
          <thead className="border-b border-line text-sm whitespace-nowrap text-muted">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">{t.dashboard.orders.colOrder}</th>
              <th scope="col" className="px-5 py-3 font-semibold">{t.dashboard.orders.colCustomer}</th>
              <th scope="col" className="px-5 py-3 font-semibold">{t.dashboard.orders.colType}</th>
              <th scope="col" className="hidden px-5 py-3 text-end font-semibold lg:table-cell">{t.dashboard.orders.colItems}</th>
              <th scope="col" className="px-5 py-3 text-end font-semibold">{t.dashboard.orders.colTotal}</th>
              <th scope="col" className="px-5 py-3 font-semibold">{t.dashboard.orders.colStatus}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                onClick={() => onOpen(order)}
                className="cursor-pointer border-b border-line/70 transition-colors last:border-0 hover:bg-paper"
              >
                <td className="px-5 py-3.5">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpen(order);
                    }}
                    className="font-mono font-bold whitespace-nowrap hover:underline"
                  >
                    {formatOrderCode(order.code)}
                  </button>
                  <p className="text-sm whitespace-nowrap text-muted">{formatDateTime(order.createdAt)}</p>
                </td>
                <td className="px-5 py-3.5">
                  <p className="font-semibold">{order.customer.name}</p>
                  <p className="digits-ltr text-end font-mono text-sm whitespace-nowrap text-muted">{formatPhone(order.customer.phone)}</p>
                </td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-2 text-ink-soft">
                    {order.fulfillment === 'delivery' ? (
                      <Moped size={18} weight="bold" aria-hidden />
                    ) : (
                      <Storefront size={18} weight="bold" aria-hidden />
                    )}
                    {order.address?.zoneName ?? t.common.pickup}
                  </span>
                </td>
                <td className="hidden px-5 py-3.5 text-end font-mono lg:table-cell">{formatNumber(itemCount(order))}</td>
                <td className="px-5 py-3.5 text-end">
                  <Price amount={order.total} />
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
