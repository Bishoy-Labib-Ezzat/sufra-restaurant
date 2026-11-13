import { Link } from 'react-router';
import { ForkKnife } from '@phosphor-icons/react';
import { formatMoney, pluralize } from '@/shared/lib/format';
import { buttonStyles } from '@/shared/ui/button-styles';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Overlay, OverlayHeader } from '@/shared/ui/Overlay';
import { Price } from '@/shared/ui/Price';
import { useCartCount, useCartLines, useCartStore, useCartSubtotal } from '../../store/cart.store';
import { useShopUi } from '../../store/shop-ui.store';
import { CartLineRow } from './CartLineRow';

export function CartDrawer() {
  const open = useShopUi((state) => state.cartOpen);
  const setOpen = useShopUi((state) => state.setCartOpen);
  const lines = useCartLines();
  const count = useCartCount();
  const subtotal = useCartSubtotal();
  const clear = useCartStore((state) => state.clear);
  const close = () => setOpen(false);

  return (
    <Overlay open={open} onClose={close} label="Your order" placement="right">
      <OverlayHeader title="Your order" subtitle={count ? pluralize(count, 'item') : undefined} onClose={close} />

      {lines.length === 0 ? (
        <EmptyState
          className="my-auto"
          icon={ForkKnife}
          title="Nothing here yet"
          description="Add a few plates from the menu and they will show up here."
          action={
            <Link to="/menu" onClick={close} className={buttonStyles({ variant: 'ink' })}>
              Browse the menu
            </Link>
          }
        />
      ) : (
        <>
          <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
            {lines.map((line) => (
              <CartLineRow key={line.productId} line={line} />
            ))}
          </ul>
          <div className="flex flex-col gap-4 border-t border-line bg-paper px-6 pt-5 pb-6">
            <div className="flex items-baseline justify-between">
              <span className="text-[15px] font-semibold">Subtotal</span>
              <Price amount={subtotal} strong className="text-lg" />
            </div>
            <p className="-mt-2 text-sm text-muted">The delivery fee depends on your area and is added at checkout.</p>
            <Link to="/checkout" onClick={close} className={buttonStyles({ size: 'lg', block: true })}>
              Checkout · {formatMoney(subtotal)}
            </Link>
            <button
              type="button"
              onClick={clear}
              className="self-center text-sm font-semibold text-muted underline-offset-4 hover:text-ink hover:underline"
            >
              Clear order
            </button>
          </div>
        </>
      )}
    </Overlay>
  );
}
