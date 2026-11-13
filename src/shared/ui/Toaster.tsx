import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle, Info, WarningOctagon, X } from '@phosphor-icons/react';
import { cn } from '@/shared/lib/cn';
import { useToastStore, type Toast } from './toast-store';

const ICONS = { success: CheckCircle, info: Info, error: WarningOctagon };

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((state) => state.dismiss);
  const Icon = ICONS[toast.tone];

  useEffect(() => {
    const id = window.setTimeout(() => dismiss(toast.id), toast.duration);
    return () => window.clearTimeout(id);
  }, [toast.id, toast.duration, dismiss]);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      className="pointer-events-auto flex w-full items-center gap-3 rounded-full bg-ink py-2 pr-2 pl-4 text-sm text-paper shadow-float sm:w-auto sm:max-w-md"
    >
      <Icon
        size={20}
        weight="fill"
        aria-hidden
        className={cn(
          'shrink-0',
          toast.tone === 'success' && 'text-[#8fd3a6]',
          toast.tone === 'error' && 'text-[#ff9b85]',
          toast.tone === 'info' && 'text-paper/70',
        )}
      />
      <span className="min-w-0 flex-1 py-1.5 leading-snug">{toast.message}</span>
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action?.onClick();
            dismiss(toast.id);
          }}
          className="h-8 shrink-0 rounded-full pointer-coarse:h-10 bg-paper px-3.5 font-semibold text-ink transition hover:bg-white"
        >
          {toast.action.label}
        </button>
      )}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => dismiss(toast.id)}
        className="grid size-8 shrink-0 pointer-coarse:size-10 place-items-center rounded-full text-paper/70 transition hover:bg-paper/10 hover:text-paper"
      >
        <X size={14} weight="bold" aria-hidden />
      </button>
    </motion.li>
  );
}

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  return (
    <ol
      aria-live="polite"
      className="pointer-events-none fixed inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:top-auto sm:right-6 sm:bottom-6 sm:items-end"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </ol>
  );
}
