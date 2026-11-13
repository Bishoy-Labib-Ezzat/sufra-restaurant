import { ArrowUpRight, Clock, MapPin, Phone } from '@phosphor-icons/react';
import { hoursLabel, restaurant } from '@/shared/config/restaurant';
import { photo } from '@/shared/lib/image';
import { buttonStyles } from '@/shared/ui/button-styles';

const INTERIOR = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4';

export function VisitSection() {
  return (
    <section className="mx-auto grid grid-cols-1 max-w-7xl items-center gap-10 px-4 pt-24 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:px-8">
      <div className="aspect-[4/3] overflow-hidden rounded-panel bg-paper-deep">
        <img
          src={photo(INTERIOR, 1100, 825)}
          alt="The dining room with warm lights and wooden tables"
          loading="lazy"
          className="size-full object-cover"
        />
      </div>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h2 className="display text-5xl sm:text-6xl">Eat in on Brazil Street</h2>
          <p className="max-w-[44ch] text-lg leading-relaxed text-ink-soft">
            An open grill, a long coffee counter and tables big enough for the whole family.
          </p>
        </div>
        <ul className="flex flex-col gap-4 text-[15px]">
          <li className="flex items-center gap-3">
            <MapPin size={20} weight="bold" className="text-tomato-deep" aria-hidden />
            {restaurant.address}
          </li>
          <li className="flex items-center gap-3">
            <Clock size={20} weight="bold" className="text-tomato-deep" aria-hidden />
            Every day, {hoursLabel}
          </li>
          <li className="flex items-center gap-3">
            <Phone size={20} weight="bold" className="text-tomato-deep" aria-hidden />
            <a href={`tel:${restaurant.phone}`} className="font-mono hover:underline">
              {restaurant.phoneDisplay}
            </a>
          </li>
        </ul>
        <a
          href={restaurant.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className={buttonStyles({ variant: 'secondary', className: 'self-start' })}
        >
          Get directions
          <ArrowUpRight size={16} weight="bold" aria-hidden />
        </a>
      </div>
    </section>
  );
}
