import { useCallback } from 'react';
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
      add(product, quantity);
      toast.success(quantity > 1 ? `${quantity} × ${product.name} added` : `${product.name} added`, {
        action: { label: 'View order', onClick: () => setCartOpen(true) },
        duration: 3200,
      });
    },
    [add, setCartOpen],
  );
}
