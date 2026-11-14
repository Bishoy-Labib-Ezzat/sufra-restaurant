import type { UseFormRegisterReturn } from 'react-hook-form';
import { Moped, Storefront } from '@phosphor-icons/react';
import { restaurant } from '@/shared/config/restaurant';
import { fill, plural, t } from '@/shared/i18n';
import { cn } from '@/shared/lib/cn';
import type { FulfillmentType } from '@/shared/types';

const OPTIONS: { value: FulfillmentType; title: string; detail: string; icon: typeof Moped }[] = [
  { value: 'delivery', title: t.shop.checkout.deliveryOption, detail: t.shop.checkout.deliveryDetail, icon: Moped },
  {
    value: 'pickup',
    title: t.shop.checkout.pickupOption,
    detail: fill(t.shop.checkout.pickupDetail, { minutes: plural(t.plurals.minutes, restaurant.pickupEtaMinutes) }),
    icon: Storefront,
  },
];

/** Two side-by-side choices at every width; on phones each one stacks icon over text. */
export function FulfillmentPicker({ value, registration }: { value: FulfillmentType; registration: UseFormRegisterReturn }) {
  return (
    <fieldset className="grid grid-cols-2 gap-2.5 sm:gap-3">
      <legend className="sr-only">{t.shop.checkout.howTitle}</legend>
      {OPTIONS.map(({ value: option, title, detail, icon: Icon }) => {
        const active = value === option;
        return (
          <label
            key={option}
            className={cn(
              'relative flex cursor-pointer flex-col items-start gap-3 rounded-panel p-4 transition-all duration-200 sm:flex-row sm:items-center sm:gap-4 sm:p-5',
              'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-tomato',
              active ? 'bg-ink text-paper' : 'bg-surface ring-1 ring-line-strong ring-inset hover:ring-ink/50',
            )}
          >
            <input type="radio" value={option} className="sr-only" {...registration} />
            <span
              className={cn(
                'grid size-11 shrink-0 place-items-center rounded-full sm:size-12',
                active ? 'bg-tomato text-white' : 'bg-paper-deep',
              )}
            >
              <Icon size={22} weight="bold" aria-hidden />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="font-display text-xl sm:text-2xl">{title}</span>
              <span className={cn('text-[13px] leading-snug sm:text-sm', active ? 'text-paper/75' : 'text-muted')}>{detail}</span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
