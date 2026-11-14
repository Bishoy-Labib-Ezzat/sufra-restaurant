import { useDeliveryZones } from '@/shared/hooks/catalog';
import { restaurant } from '@/shared/config/restaurant';
import { fill, plural, t } from '@/shared/i18n';
import { Price } from '@/shared/ui/Price';
import { Skeleton } from '@/shared/ui/states';

/** How ordering works, told as one sentence rather than a row of cards. */
export function ServiceStatement() {
  const zones = useDeliveryZones();
  const cheapest = zones.data?.length ? Math.min(...zones.data.map((zone) => zone.fee)) : null;
  const copy = t.shop.home.service;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="border-y-2 border-ink py-14 sm:py-20">
        <p className="display max-w-5xl text-[clamp(2.3rem,5.4vw,4.6rem)] leading-[1.3]">
          {copy.lead}{' '}
          <span className="text-muted">
            {fill(copy.call, { minutes: plural(t.plurals.minutes, restaurant.confirmationCallMinutes) })}
          </span>{' '}
          {copy.grill} <span className="text-muted">{copy.pay}</span>
        </p>
        <dl className="mt-12 flex flex-wrap gap-x-14 gap-y-6">
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-muted">{copy.feeLabel}</dt>
            <dd className="text-xl font-semibold">
              {cheapest === null ? (
                <Skeleton className="h-7 w-28" />
              ) : (
                <>
                  {copy.feeFrom} <Price amount={cheapest} />
                </>
              )}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-muted">{copy.areasLabel}</dt>
            <dd className="text-xl font-semibold">
              {zones.data ? (
                fill(copy.areas, { areas: plural(t.plurals.areas, zones.data.length) })
              ) : (
                <Skeleton className="h-7 w-48" />
              )}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-muted">{copy.pickupLabel}</dt>
            <dd className="text-xl font-semibold">
              {fill(copy.pickupReady, { minutes: plural(t.plurals.minutes, restaurant.pickupEtaMinutes) })}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
