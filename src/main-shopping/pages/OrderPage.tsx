import { useEffect, useRef } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { CheckCircle, Copy, Receipt } from '@phosphor-icons/react';
import { isApiError } from '@/shared/api/errors';
import { restaurant } from '@/shared/config/restaurant';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { fill, ltr, plural, t, toArabicDigits } from '@/shared/i18n';
import { formatTime } from '@/shared/lib/format';
import { customerStatusCopy, formatOrderCode, isTerminal } from '@/shared/lib/order-status';
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
  if (tracking.status === 'cancelled') return t.shop.order.cancelledHeadline;
  if (justPlaced) return fill(t.shop.order.thanks, { name: tracking.customerFirstName });
  return customerStatusCopy(tracking.status, tracking.fulfillment).title;
}

function message(tracking: OrderTracking) {
  if (tracking.status === 'cancelled') {
    return fill(t.shop.order.cancelledBody, { phone: ltr(restaurant.phoneDisplay), code: formatOrderCode(tracking.code) });
  }
  if (tracking.status === 'new' || tracking.status === 'reviewing') {
    return fill(t.shop.order.callBody, {
      digits: toArabicDigits(tracking.phoneLastDigits),
      minutes: plural(t.plurals.minutes, restaurant.confirmationCallMinutes),
    });
  }
  return customerStatusCopy(tracking.status, tracking.fulfillment).body;
}

export function OrderPage() {
  const { code = '' } = useParams();
  const location = useLocation();
  const justPlaced = Boolean((location.state as { justPlaced?: boolean } | null)?.justPlaced);
  const { data: tracking, error, isPending, refetch, isFetching } = useTrackOrder(code);
  useDocumentTitle(fill(t.shop.order.title, { code: formatOrderCode(code.toUpperCase()) }));
  useStatusChangeToast(tracking);

  if (isPending) {
    return (
      <div className="mx-auto grid grid-cols-1 max-w-7xl gap-12 px-4 pt-14 sm:px-6 lg:grid-cols-[1fr_440px] lg:px-8" role="status" aria-label={t.shop.order.loading}>
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
          title={fill(t.shop.order.notFoundTitle, { code: formatOrderCode(code.toUpperCase()) })}
          description={t.shop.order.notFoundBody}
          action={
            <Link to="/track" className={buttonStyles({ variant: 'ink' })}>
              {t.shop.order.tryAnother}
            </Link>
          }
        />
      );
    }
    return (
      <div className="mx-auto max-w-3xl px-4 pt-14">
        <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} title={t.shop.order.loadFailed} />
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
              {t.shop.order.placed}
            </p>
          )}
          <h1 className="display text-[clamp(2.8rem,7vw,5.4rem)] leading-[1.2]">{headline(tracking, justPlaced)}</h1>
          <p className="max-w-[54ch] text-lg leading-relaxed text-ink-soft">{message(tracking)}</p>
        </div>

        {tracking.status !== 'cancelled' && (
          <section className="rounded-panel bg-surface p-6 ring-1 ring-line sm:p-8" aria-labelledby="status-title">
            <div className="mb-7 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="status-title" className="font-display text-3xl">
                {closed ? t.shop.order.howItWent : t.shop.order.liveStatus}
              </h2>
              {!closed && (
                <p className="text-sm text-muted">
                  {tracking.fulfillment === 'delivery' ? t.shop.order.expectedAround : t.shop.order.readyAround}{' '}
                  <span className="font-mono font-semibold text-ink">{formatTime(zoneEta)}</span>
                </p>
              )}
            </div>
            <OrderProgress tracking={tracking} />
          </section>
        )}

        <div className="flex flex-wrap gap-3">
          <Link to="/menu" className={buttonStyles({ variant: 'ink' })}>
            {t.shop.order.backToMenu}
          </Link>
          <Button
            variant="secondary"
            icon={Copy}
            onClick={() =>
              navigator.clipboard
                .writeText(formatOrderCode(tracking.code))
                .then(() => toast.success(fill(t.shop.order.copied, { code: formatOrderCode(tracking.code) })))
                .catch(() => toast.error(t.common.copyBlocked))
            }
          >
            {t.shop.order.copy}
          </Button>
        </div>
      </div>

      <aside className="lg:pt-4">
        <ReceiptTicket tracking={tracking} />
      </aside>
    </div>
  );
}
