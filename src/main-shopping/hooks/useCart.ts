import { useEffect, useMemo } from 'react';
import { useProducts } from '@/shared/hooks/catalog';
import { calculateTotals } from '@/shared/lib/pricing';
import type { Product } from '@/shared/types';
import { useCartStore, type CartItem } from '../store/cart.store';

/** A cart item with its name, photo and current price filled in from the menu. */
export interface CartLine extends CartItem {
  name: string;
  imageUrl: string;
  unitPrice: number;
}

function toLines(items: CartItem[], products: Product[] | undefined): CartLine[] {
  if (!products) return [];
  const byId = new Map(products.map((product) => [product.id, product]));
  return items.flatMap((item) => {
    const product = byId.get(item.productId);
    return product ? [{ ...item, name: product.name, imageUrl: product.imageUrl, unitPrice: product.price }] : [];
  });
}

/**
 * The cart only stores product ids and quantities, so what it shows is always the current menu.
 * `isPending` is true while the menu is still loading for a cart that has items.
 */
export function useCartLines() {
  const items = useCartStore((state) => state.items);
  const products = useProducts();
  const lines = useMemo(() => toLines(items, products.data), [items, products.data]);
  return { lines, isPending: items.length > 0 && products.isPending };
}

export function useCartCount() {
  return useCartLines().lines.reduce((sum, line) => sum + line.quantity, 0);
}

export function useCartSubtotal() {
  return calculateTotals(useCartLines().lines).subtotal;
}

/** Removes cart items whose product was taken off the menu, so they don't linger in storage. */
export function useCartMenuSync() {
  const products = useProducts();
  const removeMissing = useCartStore((state) => state.removeMissing);

  useEffect(() => {
    if (products.data) removeMissing(new Set(products.data.map((product) => product.id)));
  }, [products.data, removeMissing]);
}
