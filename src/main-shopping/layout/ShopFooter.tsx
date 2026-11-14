import { Link } from 'react-router';
import { hoursLabel, restaurant } from '@/shared/config/restaurant';
import { fill, t } from '@/shared/i18n';

export function ShopFooter() {
  return (
    <footer className="mt-24 overflow-hidden border-t border-line">
      <div className="mx-auto grid grid-cols-1 max-w-7xl gap-10 px-4 pt-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div className="flex flex-col gap-2 text-[15px] text-ink-soft">
          <p className="font-semibold text-ink">{restaurant.legalName}</p>
          <p>{restaurant.address}</p>
          <p>{fill(t.restaurant.everyDay, { hours: hoursLabel })}</p>
          <a
            href={`tel:${restaurant.phone}`}
            className="digits-ltr inline-flex min-h-11 items-center self-start font-mono text-ink hover:text-tomato-deep"
          >
            {restaurant.phoneDisplay}
          </a>
        </div>
        <nav aria-label={t.shop.footer.nav} className="flex flex-col text-[15px]">
          <Link to="/menu" className="inline-flex min-h-11 items-center self-start font-semibold hover:text-tomato-deep">
            {t.shop.footer.menu}
          </Link>
          <Link to="/track" className="inline-flex min-h-11 items-center self-start font-semibold hover:text-tomato-deep">
            {t.shop.footer.track}
          </Link>
        </nav>
        <div className="flex flex-col text-[15px]">
          <Link to="/dashboard" className="inline-flex min-h-11 items-center self-start font-semibold hover:text-tomato-deep">
            {t.shop.footer.staff}
          </Link>
          <p className="text-muted">{t.shop.footer.payment}</p>
        </div>
      </div>
      <p
        aria-hidden
        className="display mx-auto mt-10 max-w-7xl px-2 text-center text-[27vw] leading-[1.05] text-ink select-none lg:text-[22rem]"
      >
        {t.brand.name}
      </p>
      <p className="mx-auto max-w-7xl px-4 pt-5 pb-24 text-center text-xs text-muted md:pb-5">
        {fill(t.shop.footer.copyright, { year: new Date().getFullYear(), name: restaurant.legalName })}
      </p>
    </footer>
  );
}
