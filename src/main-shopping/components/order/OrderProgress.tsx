import { Check } from '@phosphor-icons/react';
import { t } from '@/shared/i18n';
import { formatTime } from '@/shared/lib/format';
import { customerStatusCopy, ORDER_FLOW } from '@/shared/lib/order-status';
import { cn } from '@/shared/lib/cn';
import type { OrderTracking } from '@/shared/types';

/** Vertical progress of an order as the customer experiences it. */
export function OrderProgress({ tracking }: { tracking: OrderTracking }) {
  const reachedAt = new Map(tracking.history.map((entry) => [entry.status, entry.at]));
  const current = ORDER_FLOW.indexOf(tracking.status as (typeof ORDER_FLOW)[number]);

  return (
    <ol className="flex flex-col" aria-label={t.shop.order.progress}>
      {ORDER_FLOW.map((status, index) => {
        const state = index < current ? 'done' : index === current ? 'current' : 'todo';
        const copy = customerStatusCopy(status, tracking.fulfillment);
        const at = reachedAt.get(status);
        const last = index === ORDER_FLOW.length - 1;

        return (
          <li key={status} className="grid grid-cols-[2rem_1fr_auto] gap-x-4" aria-current={state === 'current' ? 'step' : undefined}>
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'relative grid size-8 shrink-0 place-items-center rounded-full',
                  state === 'done' && 'bg-ink text-paper',
                  state === 'current' && 'bg-tomato text-white',
                  state === 'todo' && 'bg-surface ring-2 ring-line-strong ring-inset',
                )}
              >
                {state === 'done' && <Check size={16} weight="bold" aria-hidden />}
                {state === 'current' && (
                  <>
                    <span className="absolute inset-0 animate-ping rounded-full bg-tomato/40" aria-hidden />
                    <span className="relative size-2.5 rounded-full bg-white" aria-hidden />
                  </>
                )}
              </span>
              {!last && <span className={cn('my-1 w-0.5 flex-1', index < current ? 'bg-ink' : 'bg-line-strong')} />}
            </div>
            <div className={cn('flex flex-col gap-0.5', last ? 'pb-0' : 'pb-7')}>
              <p className={cn('pt-1 text-[17px] font-semibold', state === 'todo' && 'text-muted')}>{copy.title}</p>
              {state === 'current' && <p className="text-[15px] text-ink-soft">{copy.body}</p>}
            </div>
            <span className="pt-1.5 font-mono text-sm text-muted tabular">{at ? formatTime(at) : ''}</span>
          </li>
        );
      })}
    </ol>
  );
}
