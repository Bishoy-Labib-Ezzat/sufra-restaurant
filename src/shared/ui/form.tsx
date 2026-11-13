import { useId, type ComponentProps, type ReactNode } from 'react';
import { CaretDown, Check, WarningCircle } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/cn';

const fieldBase =
  'w-full rounded-field bg-surface px-4 text-[15px] text-ink ring-1 ring-inset ring-line-strong ' +
  'placeholder:text-muted/80 transition-shadow duration-150 ' +
  'hover:ring-ink/40 focus:outline-none focus:ring-2 focus:ring-ink ' +
  'aria-invalid:ring-2 aria-invalid:ring-danger disabled:opacity-60';

interface FieldProps {
  label: string;
  /** Rendered after the label, e.g. "Optional" or a character counter. */
  aside?: ReactNode;
  hint?: ReactNode;
  error?: string;
  className?: string;
  children: (control: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
}

/** Label above, control, then hint or error below. Wires ids and aria attributes for the control. */
export function Field({ label, aside, hint, error, className, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>
        {aside && <span className="text-xs text-muted">{aside}</span>}
      </div>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {error ? (
        <p id={errorId} role="alert" className="flex items-center gap-1.5 text-sm font-medium text-danger">
          <WarningCircle size={16} weight="fill" aria-hidden />
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="text-sm text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(fieldBase, 'h-12', className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn(fieldBase, 'min-h-28 resize-y py-3 leading-relaxed', className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<'select'>) {
  return (
    <div className="relative">
      <select className={cn(fieldBase, 'h-12 appearance-none pr-11', className)} {...props}>
        {children}
      </select>
      <CaretDown
        size={16}
        weight="bold"
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted"
      />
    </div>
  );
}

export function Checkbox({ label, className, ...props }: ComponentProps<'input'> & { label: ReactNode }) {
  return (
    <label className={cn('inline-flex cursor-pointer items-center gap-3 text-[15px] text-ink', className)}>
      <span className="relative grid size-5 place-items-center">
        <input
          type="checkbox"
          className="peer size-5 cursor-pointer appearance-none rounded-md bg-surface ring-1 ring-inset ring-line-strong transition checked:bg-ink checked:ring-ink"
          {...props}
        />
        <Check
          size={13}
          weight="bold"
          aria-hidden
          className="pointer-events-none absolute text-paper opacity-0 peer-checked:opacity-100"
        />
      </span>
      {label}
    </label>
  );
}

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  /** Hide the visible label (it stays available to screen readers). */
  hideLabel?: boolean;
  disabled?: boolean;
  description?: string;
}

export function Switch({ checked, onChange, label, hideLabel, disabled, description }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={hideLabel ? label : undefined}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="group inline-flex items-center gap-3 text-left disabled:opacity-50"
    >
      <span
        className={cn(
          'relative h-6 w-10 shrink-0 rounded-full transition-colors duration-200',
          checked ? 'bg-status-ready' : 'bg-line-strong',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out-expo',
            checked && 'translate-x-4',
          )}
        />
      </span>
      {!hideLabel && (
        <span className="flex flex-col">
          <span className="text-[15px] font-semibold text-ink">{label}</span>
          {description && <span className="text-sm text-muted">{description}</span>}
        </span>
      )}
    </button>
  );
}

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: ReactNode }[];
  label: string;
  size?: 'sm' | 'md';
  className?: string;
}

/** Single-choice pill group, exposed as a radio group. */
export function Segmented<T extends string>({ value, onChange, options, label, size = 'md', className }: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('inline-flex rounded-full bg-paper-deep p-1', className)}
      onKeyDown={(event) => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        const index = options.findIndex((option) => option.value === value);
        const step = event.key === 'ArrowRight' ? 1 : -1;
        const next = options[(index + step + options.length) % options.length];
        onChange(next.value);
        (event.currentTarget.querySelector(`[data-value="${next.value}"]`) as HTMLElement | null)?.focus();
      }}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            data-value={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap transition-colors duration-200',
              size === 'sm' ? 'h-8 px-3.5 text-sm' : 'h-10 px-5 text-[15px]',
              active ? 'bg-ink text-paper shadow-sm' : 'text-ink-soft hover:text-ink',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

interface ChipProps extends ComponentProps<'button'> {
  active?: boolean;
}

/** Toggleable filter pill. */
export function Chip({ active, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors duration-200',
        active ? 'bg-ink text-paper' : 'bg-surface text-ink ring-1 ring-inset ring-line hover:ring-line-strong',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
