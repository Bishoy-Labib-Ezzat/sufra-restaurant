import { Link } from 'react-router';
import { hoursLabel, restaurant } from '@/shared/config/restaurant';

export function ShopFooter() {
  return (
    <footer className="mt-24 overflow-hidden border-t border-line">
      <div className="mx-auto grid grid-cols-1 max-w-7xl gap-10 px-4 pt-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div className="flex flex-col gap-2 text-[15px] text-ink-soft">
          <p className="font-semibold text-ink">{restaurant.legalName}</p>
          <p>{restaurant.address}</p>
          <p>Every day, {hoursLabel}</p>
          <a href={`tel:${restaurant.phone}`} className="inline-flex min-h-11 items-center self-start font-mono text-ink hover:text-tomato-deep">
            {restaurant.phoneDisplay}
          </a>
        </div>
        <nav aria-label="Footer" className="flex flex-col text-[15px]">
          <Link to="/menu" className="inline-flex min-h-11 items-center self-start font-semibold hover:text-tomato-deep">
            Menu
          </Link>
          <Link to="/track" className="inline-flex min-h-11 items-center self-start font-semibold hover:text-tomato-deep">
            Track an order
          </Link>
        </nav>
        <div className="flex flex-col text-[15px]">
          <Link to="/dashboard" className="inline-flex min-h-11 items-center self-start font-semibold hover:text-tomato-deep">
            Staff sign in
          </Link>
          <p className="text-muted">Cash on delivery or at pickup.</p>
        </div>
      </div>
      <p
        aria-hidden
        className="display mx-auto mt-10 max-w-7xl px-2 text-center text-[27vw] leading-[0.78] text-ink select-none lg:text-[22rem]"
      >
        sufra
      </p>
      <p className="mx-auto max-w-7xl px-4 pt-5 pb-24 text-center text-xs text-muted md:pb-5">
        © {new Date().getFullYear()} {restaurant.legalName}.
      </p>
    </footer>
  );
}
