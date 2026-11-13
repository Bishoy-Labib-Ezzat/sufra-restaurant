import { Minus, Plus, Trash } from '@phosphor-icons/react';
import { MAX_QUANTITY_PER_ITEM } from '@/shared/lib/pricing';
import { cn } from '@/shared/lib/cn';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  /** Name of the item, used in the button labels. */
  itemName: string;
  /** At 1, the minus button removes the item instead of stopping. */
  removable?: boolean;
  min?: number;
  size?: 'sm' | 'md';
  tone?: 'light' | 'ink';
  className?: string;
}

export function QuantityStepper({
  value,
  onChange,
  itemName,
  removable,
  min = 1,
  size = 'md',
  tone = 'light',
  className,
}: QuantityStepperProps) {
  const atMin = value <= min;
  const showRemove = removable && value <= 1;
  const button = cn(
    'grid place-items-center rounded-full transition-colors duration-150 disabled:opacity-35',
    size === 'sm' ? 'size-8' : 'size-10',
    tone === 'ink' ? 'text-paper hover:bg-paper/15' : 'text-ink hover:bg-ink/8',
  );

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full p-0.5',
        tone === 'ink' ? 'bg-ink text-paper' : 'bg-surface ring-1 ring-inset ring-line-strong',
        className,
      )}
    >
      <button
        type="button"
        className={button}
        onClick={() => onChange(value - 1)}
        disabled={atMin && !removable}
        aria-label={showRemove ? `Remove ${itemName}` : `One less ${itemName}`}
      >
        {showRemove ? <Trash size={size === 'sm' ? 14 : 16} weight="bold" /> : <Minus size={size === 'sm' ? 14 : 16} weight="bold" />}
      </button>
      <span
        key={value}
        aria-live="polite"
        aria-label={`${value} of ${itemName}`}
        className={cn('animate-pop text-center font-mono font-semibold tabular', size === 'sm' ? 'w-6 text-sm' : 'w-8 text-base')}
      >
        {value}
      </span>
      <button
        type="button"
        className={button}
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QUANTITY_PER_ITEM}
        aria-label={`One more ${itemName}`}
      >
        <Plus size={size === 'sm' ? 14 : 16} weight="bold" />
      </button>
    </div>
  );
}
