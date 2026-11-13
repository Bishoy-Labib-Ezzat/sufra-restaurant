import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateTotals, clampQuantity } from '@/shared/lib/pricing';
import type { Product } from '@/shared/types';

export interface CartLine {
  productId: string;
  name: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  add: (product: Pick<Product, 'id' | 'name' | 'imageUrl' | 'price'>, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  /** Refreshes names and prices from the live catalog and drops products that no longer exist. */
  syncWithCatalog: (products: Product[]) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (product, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((line) => line.productId === product.id);
          if (existing) {
            return {
              lines: state.lines.map((line) =>
                line.productId === product.id ? { ...line, quantity: clampQuantity(line.quantity + quantity) } : line,
              ),
            };
          }
          const line: CartLine = {
            productId: product.id,
            name: product.name,
            imageUrl: product.imageUrl,
            unitPrice: product.price,
            quantity: clampQuantity(quantity),
          };
          return { lines: [...state.lines, line] };
        }),
      setQuantity: (productId, quantity) =>
        set((state) => {
          const next = clampQuantity(quantity);
          return {
            lines:
              next === 0
                ? state.lines.filter((line) => line.productId !== productId)
                : state.lines.map((line) => (line.productId === productId ? { ...line, quantity: next } : line)),
          };
        }),
      remove: (productId) => set((state) => ({ lines: state.lines.filter((line) => line.productId !== productId) })),
      clear: () => set({ lines: [] }),
      syncWithCatalog: (products) =>
        set((state) => {
          const byId = new Map(products.map((product) => [product.id, product]));
          let changed = false;
          const lines = state.lines.flatMap((line) => {
            const product = byId.get(line.productId);
            if (!product) {
              changed = true;
              return [];
            }
            if (product.price !== line.unitPrice || product.name !== line.name || product.imageUrl !== line.imageUrl) {
              changed = true;
              return [{ ...line, name: product.name, imageUrl: product.imageUrl, unitPrice: product.price }];
            }
            return [line];
          });
          return changed ? { lines } : state;
        }),
    }),
    { name: 'sufra.cart', version: 1 },
  ),
);

export const useCartLines = () => useCartStore((state) => state.lines);
export const useCartQuantity = (productId: string) =>
  useCartStore((state) => state.lines.find((line) => line.productId === productId)?.quantity ?? 0);
export const useCartCount = () => useCartStore((state) => state.lines.reduce((sum, line) => sum + line.quantity, 0));
export const useCartSubtotal = () => useCartStore((state) => calculateTotals(state.lines).subtotal);
