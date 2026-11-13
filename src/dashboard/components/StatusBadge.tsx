import { STATUS_META } from '@/shared/lib/order-status';
import { cn } from '@/shared/lib/cn';
import type { OrderStatus } from '@/shared/types';

/** Status pill: the label carries the meaning, colour only reinforces it. */
export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const { label, tone } = STATUS_META[status];
  return (
    <span
      className={cn(
        'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold whitespace-nowrap',
        tone.bg,
        tone.text,
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', tone.marker)} aria-hidden />
      {label}
    </span>
  );
}
