import { AnimatePresence, motion } from 'motion/react';
import { ShoppingBag } from '@phosphor-icons/react';
import { useLocation } from 'react-router';
import { pluralize } from '@/shared/lib/format';
import { Price } from '@/shared/ui/Price';
import { useCartCount, useCartSubtotal } from '../store/cart.store';
import { useShopUi } from '../store/shop-ui.store';

const HIDDEN_ON = ['/checkout', '/order/'];

/** Thumb-reachable order summary on small screens. */
export function MobileCartBar() {
  const count = useCartCount();
  const subtotal = useCartSubtotal();
  const setCartOpen = useShopUi((state) => state.setCartOpen);
  const { pathname } = useLocation();
  const visible = count > 0 && !HIDDEN_ON.some((path) => pathname.startsWith(path));

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 96 }}
          animate={{ y: 0 }}
          exit={{ y: 96 }}
          transition={{ type: 'spring', stiffness: 420, damping: 36 }}
          className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-30 md:hidden"
        >
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="flex h-14 w-full items-center gap-3 rounded-full bg-ink pr-5 pl-2 text-paper shadow-float active:scale-[0.98]"
          >
            <span className="relative grid size-10 place-items-center rounded-full bg-tomato">
              <ShoppingBag size={20} weight="bold" aria-hidden />
            </span>
            <span className="flex-1 text-left text-[15px] font-semibold">View order ({pluralize(count, 'item')})</span>
            <Price amount={subtotal} className="text-paper [&>span:first-child]:text-paper/60" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
