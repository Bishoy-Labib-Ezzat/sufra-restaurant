import type { ElementType, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface EmptyStateProps {
  icon: ElementType;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-4 px-6 py-14 text-center', className)}>
      <span className="grid size-16 place-items-center rounded-full bg-paper-deep text-ink-soft">
        <Icon size={30} weight="duotone" aria-hidden />
      </span>
      <div className="flex max-w-sm flex-col gap-1.5">
        <p className="font-display text-2xl font-bold tracking-tight">{title}</p>
        {description && <p className="text-[15px] leading-relaxed text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
