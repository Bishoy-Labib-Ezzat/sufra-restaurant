import type { UseFormRegisterReturn } from 'react-hook-form';
import { Moped, Storefront } from '@phosphor-icons/react';
import { restaurant } from '@/shared/config/restaurant';
import { cn } from '@/shared/lib/cn';
import type { FulfillmentType } from '@/shared/types';

const OPTIONS: { value: FulfillmentType; title: string; detail: string; icon: typeof Moped }[] = [
  { value: 'delivery', title: 'Delivery', detail: 'To your door, fee by area', icon: Moped },
  { value: 'pickup', title: 'Pickup', detail: `Ready in about ${restaurant.pickupEtaMinutes} min, no fee`, icon: Storefront },
];

export function FulfillmentPicker({ value, registration }: { value: FulfillmentType; registration: UseFormRegisterReturn }) {
  return (
    <fieldset className="grid gap-3 sm:grid-cols-2">
      <legend className="sr-only">How should we get it to you?</legend>
      {OPTIONS.map(({ value: option, title, detail, icon: Icon }) => {
        const active = value === option;
        return (
          <label
            key={option}
            className={cn(
              'relative flex cursor-pointer items-center gap-4 rounded-panel p-5 transition-all duration-200',
              'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-tomato',
              active ? 'bg-ink text-paper' : 'bg-surface ring-1 ring-line-strong ring-inset hover:ring-ink/50',
            )}
          >
            <input type="radio" value={option} className="sr-only" {...registration} />
            <span className={cn('grid size-12 shrink-0 place-items-center rounded-full', active ? 'bg-tomato text-white' : 'bg-paper-deep')}>
              <Icon size={24} weight="bold" aria-hidden />
            </span>
            <span className="flex flex-col">
              <span className="font-display text-xl font-bold">{title}</span>
              <span className={cn('text-sm', active ? 'text-paper/75' : 'text-muted')}>{detail}</span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
