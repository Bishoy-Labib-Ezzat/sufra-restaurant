import { t } from '@/shared/i18n';
import { formatAmount } from '@/shared/lib/format';
import { cn } from '@/shared/lib/cn';

/** Price with a small currency label after it ("٢٣٠ ج.م"): the number carries the weight. */
export function Price({ amount, className, strong }: { amount: number; className?: string; strong?: boolean }) {
  return (
    <span className={cn('inline-flex items-baseline gap-1 whitespace-nowrap font-mono tabular', className)}>
      <span className={cn(strong ? 'font-bold' : 'font-semibold')}>{formatAmount(amount)}</span>
      <span className="text-[max(0.68em,11px)] font-medium text-muted">{t.units.currency}</span>
    </span>
  );
}
