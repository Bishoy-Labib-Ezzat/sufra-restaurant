import { t } from '@/shared/i18n';
import { cn } from '@/shared/lib/cn';

/** Brand mark: a plate seen from above, set on the table line. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn('size-8 shrink-0', className)}>
      <circle cx="16" cy="16" r="15" fill="var(--color-tomato)" />
      <circle cx="16" cy="16" r="9" fill="none" stroke="var(--color-paper)" strokeWidth="2.5" />
      <rect x="4" y="27" width="24" height="3" rx="1.5" fill="var(--color-ink)" />
    </svg>
  );
}

export function Logo({ className, tone = 'ink' }: { className?: string; tone?: 'ink' | 'paper' }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark />
      <span className={cn('display text-[1.9rem] leading-none', tone === 'paper' ? 'text-paper' : 'text-ink')}>
        {t.brand.name}
      </span>
    </span>
  );
}
