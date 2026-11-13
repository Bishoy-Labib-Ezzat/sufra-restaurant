import { Link, NavLink } from 'react-router';
import { ShoppingBag } from '@phosphor-icons/react';
import { isOpenNow } from '@/shared/config/restaurant';
import { cn } from '@/shared/lib/cn';
import { Logo } from '@/shared/ui/Logo';
import { Price } from '@/shared/ui/Price';
import { useCartCount, useCartSubtotal } from '../store/cart.store';
import { useRecentOrders, useShopUi } from '../store/shop-ui.store';

const navLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-full px-3.5 py-2 text-[15px] font-semibold transition-colors',
    isActive ? 'bg-ink/8 text-ink' : 'text-ink-soft hover:text-ink',
  );

export function ShopHeader() {
  const count = useCartCount();
  const subtotal = useCartSubtotal();
  const setCartOpen = useShopUi((state) => state.setCartOpen);
  const latestOrder = useRecentOrders((state) => state.codes[0]);
  const open = isOpenNow();

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/88 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="Sufra home" className="mr-2 shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Main" className="flex items-center gap-0.5">
          <NavLink to="/menu" className={navLink}>
            Menu
          </NavLink>
          <NavLink to={latestOrder ? `/order/${latestOrder}` : '/track'} className={cn(navLink, 'hidden sm:inline-flex')}>
            {latestOrder ? 'Your order' : 'Track order'}
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden items-center gap-2 text-sm text-muted lg:inline-flex">
            <span className={cn('size-2 rounded-full', open ? 'bg-status-ready' : 'bg-status-done')} aria-hidden />
            {open ? 'Kitchen open until 1 AM' : 'Closed now, opens 12 PM'}
          </span>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="inline-flex h-11 items-center gap-2.5 rounded-full bg-ink pr-4 pl-3 text-paper transition-colors hover:bg-forest-soft active:scale-[0.97]"
            aria-label={`Open your order, ${count} items`}
          >
            <span className="relative">
              <ShoppingBag size={20} weight="bold" aria-hidden />
              {count > 0 && (
                <span
                  key={count}
                  className="absolute -top-2 -right-2.5 grid h-[18px] min-w-[18px] animate-pop place-items-center rounded-full bg-tomato px-1 font-mono text-[11px] font-bold"
                >
                  {count}
                </span>
              )}
            </span>
            <span className="hidden text-sm font-semibold sm:inline">
              {count > 0 ? <Price amount={subtotal} className="text-paper [&>span:first-child]:text-paper/60" /> : 'Order'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
