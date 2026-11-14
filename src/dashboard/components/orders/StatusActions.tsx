import { useState } from 'react';
import { LockSimple, Prohibit } from '@phosphor-icons/react';
import { fill, t } from '@/shared/i18n';
import { formatDateTime } from '@/shared/lib/format';
import {
  advanceLabel,
  ALL_STATUSES,
  canTransition,
  formatOrderCode,
  isTerminal,
  nextStatus,
  STATUS_META,
} from '@/shared/lib/order-status';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Field, Select, Textarea } from '@/shared/ui/form';
import type { Order, OrderStatus } from '@/shared/types';
import { useUpdateOrderStatus } from '../../hooks/orders';

export function StatusActions({ order }: { order: Order }) {
  const updateStatus = useUpdateOrderStatus();
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState('');
  const next = nextStatus(order.status);
  const busy = updateStatus.isPending;

  if (isTerminal(order.status)) {
    return (
      <p className="flex items-center gap-2 rounded-field bg-paper-deep px-4 py-3 text-sm text-ink-soft">
        <LockSimple size={16} weight="bold" aria-hidden />
        {fill(t.dashboard.orders.closedNote, { status: STATUS_META[order.status].label, time: formatDateTime(order.updatedAt) })}
      </p>
    );
  }

  const move = (status: OrderStatus, note?: string) =>
    updateStatus.mutate({ order, status, note }, { onSuccess: () => setCancelling(false) });

  const otherStatuses = ALL_STATUSES.filter((status) => status !== 'cancelled' && canTransition(order.status, status));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {next && (
          <Button variant={order.status === 'new' ? 'primary' : 'ink'} loading={busy && updateStatus.variables?.status === next} onClick={() => move(next)}>
            {advanceLabel(order.status, order.fulfillment)}
          </Button>
        )}
        <label className="sr-only" htmlFor={`move-${order.id}`}>
          {t.dashboard.orders.moveLabel}
        </label>
        <Select
          id={`move-${order.id}`}
          value=""
          disabled={busy}
          onChange={(event) => event.target.value && move(event.target.value as OrderStatus)}
          className="h-11 w-auto rounded-full pe-10 text-base font-semibold sm:text-sm"
        >
          <option value="">{t.dashboard.orders.moveTo}</option>
          {otherStatuses.map((status) => (
            <option key={status} value={status}>
              {STATUS_META[status].label}
            </option>
          ))}
        </Select>
        <Button variant="ghost" icon={Prohibit} disabled={busy} onClick={() => setCancelling(true)} className="text-danger hover:bg-danger-wash">
          {t.dashboard.orders.cancel}
        </Button>
      </div>

      <ConfirmDialog
        open={cancelling}
        title={fill(t.dashboard.orders.cancelTitle, { code: formatOrderCode(order.code) })}
        description={t.dashboard.orders.cancelBody}
        confirmLabel={t.dashboard.orders.cancel}
        tone="danger"
        loading={busy}
        onConfirm={() => move('cancelled', reason)}
        onCancel={() => setCancelling(false)}
      >
        <Field label={t.dashboard.orders.reason} aside={t.dashboard.orders.reasonAside}>
          {({ id }) => (
            <Textarea
              id={id}
              value={reason}
              maxLength={200}
              onChange={(event) => setReason(event.target.value)}
              placeholder={t.dashboard.orders.reasonPlaceholder}
              className="min-h-20"
            />
          )}
        </Field>
      </ConfirmDialog>
    </div>
  );
}
