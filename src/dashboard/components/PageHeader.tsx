import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Small line above the title, e.g. a back link. */
  above?: ReactNode;
}

export function PageHeader({ title, description, actions, above }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 pb-8 md:flex-row md:items-end md:justify-between">
      <div className="flex min-w-0 flex-col gap-2">
        {above}
        <h1 className="display text-5xl leading-[1.2] sm:text-6xl">{title}</h1>
        {description && <p className="max-w-[60ch] text-[15px] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/** Quiet container for a dashboard block. Groups content without heavy card chrome. */
export function Panel({
  title,
  aside,
  children,
  className,
}: {
  title?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('rounded-panel bg-surface p-5 ring-1 ring-line sm:p-6', className)}>
      {(title || aside) && (
        <div className="mb-5 flex items-baseline justify-between gap-4">
          {title && <h2 className="font-display text-2xl">{title}</h2>}
          {aside && <div className="text-sm text-muted">{aside}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
