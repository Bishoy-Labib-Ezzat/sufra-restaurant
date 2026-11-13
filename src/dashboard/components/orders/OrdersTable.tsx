import { Moped, Storefront } from '@phosphor-icons/react';
import { formatDateTime } from '@/shared/lib/format';
import { formatPhone } from '@/shared/lib/phone';
import { Price } from '@/shared/ui/Price';
import type { Order } from '@/shared/types';
import { StatusBadge } from '../StatusBadge';

export function OrdersTable({ orders, onOpen }: { orders: Order[]; onOpen: (order: Order) => void }) {
  return (
    <div className="overflow-hidden rounded-panel bg-surface ring-1 ring-line">
      <table className="w-full text-left text-[15px]">
        <thead className="border-b border-line text-sm whitespace-nowrap text-muted">
          <tr>
            <th scope="col" className="px-5 py-3 font-semibold">Order</th>
            <th scope="col" className="px-5 py-3 font-semibold">Customer</th>
            <th scope="col" className="hidden px-5 py-3 font-semibold md:table-cell">Type</th>
            <th scope="col" className="hidden px-5 py-3 text-right font-semibold lg:table-cell">Items</th>
            <th scope="col" className="hidden px-5 py-3 text-right font-semibold sm:table-cell">Total</th>
            <th scope="col" className="px-5 py-3 font-semibold">Status</th>
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
                  className="font-mono font-bold hover:underline"
                >
                  {order.code}
                </button>
                <p className="text-sm text-muted">{formatDateTime(order.createdAt)}</p>
              </td>
              <td className="px-5 py-3.5">
                <p className="font-semibold">{order.customer.name}</p>
                <p className="font-mono text-sm text-muted">{formatPhone(order.customer.phone)}</p>
              </td>
              <td className="hidden px-5 py-3.5 md:table-cell">
                <span className="inline-flex items-center gap-2 text-ink-soft">
                  {order.fulfillment === 'delivery' ? (
                    <Moped size={18} weight="bold" aria-hidden />
                  ) : (
                    <Storefront size={18} weight="bold" aria-hidden />
                  )}
                  {order.address?.zoneName ?? 'Pickup'}
                </span>
              </td>
              <td className="hidden px-5 py-3.5 text-right font-mono lg:table-cell">
                {order.items.reduce((sum, item) => sum + item.quantity, 0)}
              </td>
              <td className="hidden px-5 py-3.5 text-right sm:table-cell">
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
  );
}
