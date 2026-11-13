import { formatAmount } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';

/** Price with a small currency label: the number carries the weight. */
export function Price({ amount, className, strong }: { amount: number; className?: string; strong?: boolean }) {
  return (
    <span className={cn('inline-flex items-baseline gap-1 whitespace-nowrap font-mono tabular', className)}>
      <span className="text-[0.68em] font-medium tracking-wide text-muted">EGP</span>
      <span className={cn(strong ? 'font-bold' : 'font-semibold')}>{formatAmount(amount)}</span>
    </span>
  );
}
