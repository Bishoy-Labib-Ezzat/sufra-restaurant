import { cn } from '@/shared/lib/cn';

/** Inline busy indicator for buttons. Content areas use skeletons instead. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent',
        className,
      )}
    />
  );
}
