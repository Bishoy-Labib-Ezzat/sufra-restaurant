import { useDeliveryZones } from '@/shared/hooks/catalog';
import { restaurant } from '@/shared/config/restaurant';
import { Price } from '@/shared/ui/Price';
import { Skeleton } from '@/shared/ui/states';

/** How ordering works, told as one sentence rather than a row of cards. */
export function ServiceStatement() {
  const zones = useDeliveryZones();
  const cheapest = zones.data?.length ? Math.min(...zones.data.map((zone) => zone.fee)) : null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="border-y-2 border-ink py-14 sm:py-20">
        <p className="display max-w-5xl text-[clamp(2.3rem,5.4vw,4.6rem)] leading-[1.02]">
          Order online. <span className="text-muted">We call within {restaurant.confirmationCallMinutes} minutes to confirm,</span>{' '}
          then the grill goes on. <span className="text-muted">Pay cash at your door or at our counter.</span>
        </p>
        <dl className="mt-12 flex flex-wrap gap-x-14 gap-y-6">
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-muted">Delivery fee</dt>
            <dd className="text-xl font-semibold">
              {cheapest === null ? <Skeleton className="h-7 w-28" /> : <>from <Price amount={cheapest} /></>}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-muted">We deliver to</dt>
            <dd className="text-xl font-semibold">
              {zones.data ? `${zones.data.length} areas, Zamalek to New Cairo` : <Skeleton className="h-7 w-48" />}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-muted">Pickup</dt>
            <dd className="text-xl font-semibold">Ready in about {restaurant.pickupEtaMinutes} minutes</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
