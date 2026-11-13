import { useEffect, useRef } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { CheckCircle, Copy, Receipt } from '@phosphor-icons/react';
import { isApiError } from '@/shared/api/errors';
import { restaurant } from '@/shared/config/restaurant';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { formatTime } from '@/shared/lib/format';
import { customerStatusCopy, isTerminal } from '@/shared/lib/order-status';
import { Button } from '@/shared/ui/Button';
import { buttonStyles } from '@/shared/ui/button-styles';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState, Skeleton } from '@/shared/ui/states';
import { toast } from '@/shared/ui/toast-store';
import type { OrderTracking } from '@/shared/types';
import { OrderProgress } from '../components/order/OrderProgress';
import { ReceiptTicket } from '../components/order/ReceiptTicket';
import { useTrackOrder } from '../hooks/orders';

function useStatusChangeToast(tracking: OrderTracking | undefined) {
  const previous = useRef<string | null>(null);
  useEffect(() => {
    if (!tracking) return;
    if (previous.current && previous.current !== tracking.status) {
      toast.info(customerStatusCopy(tracking.status, tracking.fulfillment).title);
    }
    previous.current = tracking.status;
  }, [tracking]);
}

function headline(tracking: OrderTracking, justPlaced: boolean) {
  if (tracking.status === 'cancelled') return 'This order was cancelled';
  if (justPlaced) return `Thanks, ${tracking.customerFirstName}. Your order is in.`;
  return customerStatusCopy(tracking.status, tracking.fulfillment).title;
}

function message(tracking: OrderTracking) {
  if (tracking.status === 'cancelled') {
    return `If this is unexpected, call us on ${restaurant.phoneDisplay} and quote ${tracking.code}.`;
  }
  if (tracking.status === 'new' || tracking.status === 'reviewing') {
    return `We will call your number ending in ${tracking.phoneLastDigits} within ${restaurant.confirmationCallMinutes} minutes to confirm the order and its details. Keep your phone close.`;
  }
  return customerStatusCopy(tracking.status, tracking.fulfillment).body;
}

export function OrderPage() {
  const { code = '' } = useParams();
  const location = useLocation();
  const justPlaced = Boolean((location.state as { justPlaced?: boolean } | null)?.justPlaced);
  const { data: tracking, error, isPending, refetch, isFetching } = useTrackOrder(code);
  useDocumentTitle(`Order ${code.toUpperCase()}`);
  useStatusChangeToast(tracking);

  if (isPending) {
    return (
      <div className="mx-auto grid grid-cols-1 max-w-7xl gap-12 px-4 pt-14 sm:px-6 lg:grid-cols-[1fr_440px] lg:px-8" role="status" aria-label="Loading your order">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-16 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="mt-6 h-80 w-full rounded-panel" />
        </div>
        <Skeleton className="h-[420px] rounded-panel" />
      </div>
    );
  }

  if (error || !tracking) {
    if (isApiError(error) && error.isNotFound) {
      return (
        <EmptyState
          className="py-28"
          icon={Receipt}
          title={`We could not find ${code.toUpperCase()}`}
          description="Check the order number on your confirmation, or call us and we will look it up."
          action={
            <Link to="/track" className={buttonStyles({ variant: 'ink' })}>
              Try another number
            </Link>
          }
        />
      );
    }
    return (
      <div className="mx-auto max-w-3xl px-4 pt-14">
        <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} title="We could not load your order" />
      </div>
    );
  }

  const zoneEta = new Date(new Date(tracking.createdAt).getTime() + tracking.etaMinutes * 60_000).toISOString();
  const closed = isTerminal(tracking.status);

  return (
    <div className="mx-auto grid grid-cols-1 max-w-7xl gap-12 px-4 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-16 lg:px-8 lg:pt-16">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col items-start gap-5">
          {justPlaced && (
            <p className="inline-flex items-center gap-2 rounded-full bg-status-ready-wash px-3.5 py-1.5 text-sm font-semibold text-status-ready-ink">
              <CheckCircle size={18} weight="fill" aria-hidden />
              Order placed successfully
            </p>
          )}
          <h1 className="display text-[clamp(3rem,7vw,5.6rem)] leading-[0.92]">{headline(tracking, justPlaced)}</h1>
          <p className="max-w-[54ch] text-lg leading-relaxed text-ink-soft">{message(tracking)}</p>
        </div>

        {tracking.status !== 'cancelled' && (
          <section className="rounded-panel bg-surface p-6 ring-1 ring-line sm:p-8" aria-labelledby="status-title">
            <div className="mb-7 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="status-title" className="font-display text-2xl font-bold">
                {closed ? 'How it went' : 'Live status'}
              </h2>
              {!closed && (
                <p className="text-sm text-muted">
                  {tracking.fulfillment === 'delivery' ? 'Expected around ' : 'Ready around '}
                  <span className="font-mono font-semibold text-ink">{formatTime(zoneEta)}</span>
                </p>
              )}
            </div>
            <OrderProgress tracking={tracking} />
          </section>
        )}

        <div className="flex flex-wrap gap-3">
          <Link to="/menu" className={buttonStyles({ variant: 'ink' })}>
            Back to the menu
          </Link>
          <Button
            variant="secondary"
            icon={Copy}
            onClick={() =>
              navigator.clipboard
                .writeText(tracking.code)
                .then(() => toast.success(`${tracking.code} copied`))
                .catch(() => toast.error('Copying is blocked in this browser.'))
            }
          >
            Copy order number
          </Button>
        </div>
      </div>

      <aside className="lg:pt-4">
        <ReceiptTicket tracking={tracking} />
      </aside>
    </div>
  );
}
