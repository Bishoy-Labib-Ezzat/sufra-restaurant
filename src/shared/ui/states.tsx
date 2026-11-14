import type { ElementType, ReactNode } from 'react';
import { ArrowClockwise, PlugsConnected } from '@phosphor-icons/react';
import { getErrorMessage } from '@/shared/api/errors';
import { t } from '@/shared/i18n';
import { cn } from '@/shared/lib/cn';
import { Button } from './Button';

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('skeleton rounded-thumb', className)} />;
}

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  retrying?: boolean;
  title?: string;
  compact?: boolean;
}

export function ErrorState({ error, onRetry, retrying, title = t.states.loadFailed, compact }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-start gap-4 rounded-panel bg-surface ring-1 ring-line',
        compact ? 'p-5' : 'p-8 sm:p-10',
      )}
    >
      <span className="grid size-11 place-items-center rounded-full bg-tomato-wash text-tomato-deep">
        <PlugsConnected size={22} weight="bold" aria-hidden />
      </span>
      <div className="flex flex-col gap-1">
        <p className="font-display text-xl font-bold">{title}</p>
        <p className="max-w-[52ch] text-[15px] text-muted">{getErrorMessage(error)}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" icon={ArrowClockwise} loading={retrying} onClick={onRetry}>
          {t.common.tryAgain}
        </Button>
      )}
    </div>
  );
}


export function LoadingRows({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-3', className)} role="status" aria-label={t.common.loading}>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className="h-16 w-full" />
      ))}
    </div>
  );
}

export function InlineNotice({
  tone = 'info',
  icon: Icon,
  children,
  action,
}: {
  tone?: 'info' | 'warning' | 'danger';
  icon?: ElementType;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-field px-4 py-3 text-sm',
        tone === 'info' && 'bg-paper-deep text-ink-soft',
        tone === 'warning' && 'bg-status-new-wash text-status-new-ink',
        tone === 'danger' && 'bg-danger-wash text-danger',
      )}
    >
      {Icon && <Icon size={18} weight="bold" aria-hidden className="shrink-0" />}
      <div className="min-w-0 flex-1">{children}</div>
      {action}
    </div>
  );
}
