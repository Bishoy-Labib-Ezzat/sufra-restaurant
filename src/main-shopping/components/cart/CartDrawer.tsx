import { Link } from 'react-router';
import { ForkKnife } from '@phosphor-icons/react';
import { fill, plural, t } from '@/shared/i18n';
import { formatMoney } from '@/shared/lib/format';
import { buttonStyles } from '@/shared/ui/button-styles';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Overlay, OverlayHeader } from '@/shared/ui/Overlay';
import { Price } from '@/shared/ui/Price';
import { useCartCount, useCartLines, useCartSubtotal } from '../../hooks/useCart';
import { useCartStore } from '../../store/cart.store';
import { useShopUi } from '../../store/shop-ui.store';
import { CartLineRow } from './CartLineRow';

export function CartDrawer() {
  const open = useShopUi((state) => state.cartOpen);
  const setOpen = useShopUi((state) => state.setCartOpen);
  const { lines } = useCartLines();
  const count = useCartCount();
  const subtotal = useCartSubtotal();
  const clear = useCartStore((state) => state.clear);
  const close = () => setOpen(false);

  return (
    <Overlay open={open} onClose={close} label={t.shop.cart.title} placement="side">
      <OverlayHeader title={t.shop.cart.title} subtitle={count ? plural(t.plurals.items, count) : undefined} onClose={close} />

      {lines.length === 0 ? (
        <EmptyState
          className="my-auto"
          icon={ForkKnife}
          title={t.shop.cart.emptyTitle}
          description={t.shop.cart.emptyBody}
          action={
            <Link to="/menu" onClick={close} className={buttonStyles({ variant: 'ink' })}>
              {t.shop.cart.browse}
            </Link>
          }
        />
      ) : (
        <>
          <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto overscroll-contain px-5 sm:px-6">
            {lines.map((line) => (
              <CartLineRow key={line.productId} line={line} />
            ))}
          </ul>
          <div className="flex flex-col gap-4 border-t border-line bg-paper px-5 pt-5 pb-5 sm:px-6 sm:pb-6">
            <div className="flex items-baseline justify-between">
              <span className="text-[15px] font-semibold">{t.common.subtotal}</span>
              <Price amount={subtotal} strong className="text-lg" />
            </div>
            <p className="-mt-2 text-sm text-muted">{t.shop.cart.feeNote}</p>
            <Link to="/checkout" onClick={close} className={buttonStyles({ size: 'lg', block: true })}>
              {fill(t.shop.cart.checkout, { price: formatMoney(subtotal) })}
            </Link>
            <button
              type="button"
              onClick={clear}
              className="self-center text-sm font-semibold text-muted underline-offset-4 hover:text-ink hover:underline"
            >
              {t.shop.cart.clear}
            </button>
          </div>
        </>
      )}
    </Overlay>
  );
}
