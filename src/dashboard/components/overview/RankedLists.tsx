import { photo } from '@/shared/lib/image';
import { ORDER_FLOW, STATUS_META } from '@/shared/lib/order-status';
import { cn } from '@/shared/lib/cn';
import { Price } from '@/shared/ui/Price';
import type { DashboardOverview } from '@/shared/types';

/** Best sellers with a bare magnitude bar (no background track) under each name. */
export function BestSellers({ items }: { items: DashboardOverview['topProducts'] }) {
  if (!items.length) return <p className="text-sm text-muted">No sales in the last 7 days.</p>;
  const max = Math.max(...items.map((item) => item.quantity));
  return (
    <ol className="flex flex-col gap-4">
      {items.map((item, index) => (
        <li key={item.productId} className="flex items-center gap-3">
          <span className="w-4 font-mono text-sm text-muted">{index + 1}</span>
          <img src={photo(item.imageUrl, 96, 96)} alt="" className="size-11 rounded-thumb object-cover" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-[15px] font-semibold">{item.name}</span>
              <span className="shrink-0 font-mono text-sm">
                {item.quantity} <span className="text-muted">sold</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-1 rounded-full bg-ink" style={{ width: `${(item.quantity / max) * 70}%` }} aria-hidden />
              <Price amount={item.revenue} className="ml-auto text-xs text-muted" />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Today's orders by status as a labelled ranking. The label names the status; the bar only shows size. */
export function StatusMix({ breakdown }: { breakdown: DashboardOverview['statusBreakdown'] }) {
  const order = [...ORDER_FLOW, 'cancelled'] as const;
  const rows = order
    .map((status) => breakdown.find((entry) => entry.status === status) ?? { status, count: 0 })
    .filter((row) => row.count > 0);
  if (!rows.length) return <p className="text-sm text-muted">No orders yet today.</p>;
  const max = Math.max(...rows.map((row) => row.count));

  return (
    <ul className="flex flex-col gap-3">
      {rows.map(({ status, count }) => (
        <li key={status} className="grid grid-cols-[7.5rem_1fr_2rem] items-center gap-3 text-[15px]">
          <span className="flex items-center gap-2">
            <span className={cn('size-2 rounded-full', STATUS_META[status].tone.marker)} aria-hidden />
            {STATUS_META[status].label}
          </span>
          <span className="h-2 rounded-r-[4px] bg-ink/80" style={{ width: `${(count / max) * 100}%` }} aria-hidden />
          <span className="text-right font-mono font-semibold">{count}</span>
        </li>
      ))}
    </ul>
  );
}
