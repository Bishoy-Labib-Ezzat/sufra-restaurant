import type { ReactNode } from 'react';
import { t } from '@/shared/i18n';
import { Button } from './Button';
import { Overlay } from './Overlay';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'danger' | 'default';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Extra controls, e.g. a reason field. */
  children?: ReactNode;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = t.common.keepIt,
  tone = 'default',
  loading,
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  return (
    <Overlay open={open} onClose={onCancel} label={title} className="sm:max-w-md">
      <div className="flex flex-col gap-5 p-6 sm:p-7">
        <div className="flex flex-col gap-2">
          <h2 className="display text-3xl">{title}</h2>
          <div className="text-[15px] leading-relaxed text-muted">{description}</div>
        </div>
        {children}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} data-autofocus>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'ink'} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Overlay>
  );
}
