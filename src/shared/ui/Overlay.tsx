import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/cn';
import { IconButton } from './Button';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let openOverlays = 0;

function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    openOverlays += 1;
    const root = document.documentElement;
    const scrollbar = window.innerWidth - root.clientWidth;
    root.style.overflow = 'hidden';
    root.style.paddingRight = `${scrollbar}px`;
    return () => {
      openOverlays -= 1;
      if (openOverlays === 0) {
        root.style.overflow = '';
        root.style.paddingRight = '';
      }
    };
  }, [active]);
}

/** Moves focus into the panel, keeps Tab inside it, and gives focus back on close. */
function useFocusTrap(panel: React.RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (!active) return;
    const previous = document.activeElement as HTMLElement | null;
    const node = panel.current;
    const autofocus = node?.querySelector<HTMLElement>('[data-autofocus]');
    (autofocus ?? node?.querySelector<HTMLElement>(FOCUSABLE) ?? node)?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !node) return;
      const items = [...node.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    node?.addEventListener('keydown', onKeyDown);
    return () => {
      node?.removeEventListener('keydown', onKeyDown);
      previous?.focus?.({ preventScroll: true });
    };
  }, [panel, active]);
}

type Placement = 'center' | 'right';

interface OverlayProps {
  open: boolean;
  onClose: () => void;
  /** Called once the closing animation has finished. */
  onExited?: () => void;
  /** Accessible name of the dialog. */
  label: string;
  placement?: Placement;
  className?: string;
  children: ReactNode;
}

function Panel({ onClose, label, placement = 'center', className, children }: Omit<OverlayProps, 'open' | 'onExited'>) {
  const panelRef = useRef<HTMLDivElement>(null);
  useScrollLock(true);
  useFocusTrap(panelRef, true);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };
    const node = panelRef.current;
    node?.addEventListener('keydown', onKeyDown);
    return () => node?.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const right = placement === 'right';
  return (
    <div
      className={cn('fixed inset-0 z-50 flex', right ? 'justify-end' : 'items-end justify-center sm:items-center sm:p-6')}
    >
      <motion.div
        className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[94dvh] w-full flex-col overflow-hidden bg-surface shadow-float focus:outline-none',
          right ? 'h-dvh max-h-dvh sm:max-w-md' : 'rounded-t-panel sm:max-w-lg sm:rounded-panel',
          className,
        )}
        initial={right ? { x: '100%' } : { y: 48, opacity: 0 }}
        animate={right ? { x: 0 } : { y: 0, opacity: 1 }}
        exit={right ? { x: '100%' } : { y: 32, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 38 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function Overlay({ open, onExited, ...props }: OverlayProps) {
  return createPortal(
    <AnimatePresence onExitComplete={onExited}>{open && <Panel {...props} />}</AnimatePresence>,
    document.body,
  );
}

/** Header row for overlays: title on the left, close button on the right. */
export function OverlayHeader({ title, subtitle, onClose }: { title: ReactNode; subtitle?: ReactNode; onClose: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-6 pt-5 pb-4">
      <div className="min-w-0">
        <h2 className="display text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      <IconButton icon={X} label="Close" onClick={onClose} className="-mr-2" />
    </div>
  );
}
