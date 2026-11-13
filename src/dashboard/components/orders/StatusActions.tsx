import { useState } from 'react';
import { LockSimple, Prohibit } from '@phosphor-icons/react';
import { formatDateTime } from '@/shared/lib/format';
import { advanceLabel, ALL_STATUSES, canTransition, isTerminal, nextStatus, STATUS_META } from '@/shared/lib/order-status';
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
        {STATUS_META[order.status].label} {formatDateTime(order.updatedAt)}. Closed orders cannot change.
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
          Move to another status
        </label>
        <Select
          id={`move-${order.id}`}
          value=""
          disabled={busy}
          onChange={(event) => event.target.value && move(event.target.value as OrderStatus)}
          className="h-11 w-auto rounded-full pr-10 text-base font-semibold sm:text-sm"
        >
          <option value="">Move to…</option>
          {otherStatuses.map((status) => (
            <option key={status} value={status}>
              {STATUS_META[status].label}
            </option>
          ))}
        </Select>
        <Button variant="ghost" icon={Prohibit} disabled={busy} onClick={() => setCancelling(true)} className="text-danger hover:bg-danger-wash">
          Cancel order
        </Button>
      </div>

      <ConfirmDialog
        open={cancelling}
        title={`Cancel ${order.code}?`}
        description="The customer sees the order as cancelled. This cannot be undone."
        confirmLabel="Cancel order"
        tone="danger"
        loading={busy}
        onConfirm={() => move('cancelled', reason)}
        onCancel={() => setCancelling(false)}
      >
        <Field label="Reason" aside="Optional, staff only">
          {({ id }) => (
            <Textarea
              id={id}
              value={reason}
              maxLength={200}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Customer did not answer the confirmation call."
              className="min-h-20"
            />
          )}
        </Field>
      </ConfirmDialog>
    </div>
  );
}
