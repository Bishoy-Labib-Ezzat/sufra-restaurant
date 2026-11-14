import { useCallback } from 'react';
import { fill, t } from '@/shared/i18n';
import { toast } from '@/shared/ui/toast-store';
import type { Product } from '@/shared/types';
import { useCartStore } from '../store/cart.store';
import { useShopUi } from '../store/shop-ui.store';

export function useAddToCart() {
  const add = useCartStore((state) => state.add);
  const setCartOpen = useShopUi((state) => state.setCartOpen);

  return useCallback(
    (product: Product, quantity = 1) => {
      if (!product.isAvailable) return;
      add(product.id, quantity);
      toast.success(fill(quantity > 1 ? t.shop.toasts.addedMany : t.shop.toasts.added, { count: quantity, name: product.name }), {
        action: { label: t.shop.toasts.viewOrder, onClick: () => setCartOpen(true) },
        duration: 3200,
      });
    },
    [add, setCartOpen],
  );
}
