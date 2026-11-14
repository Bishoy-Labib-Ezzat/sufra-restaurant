import { create } from 'zustand';
import { persist, type PersistStorage, type StorageValue } from 'zustand/middleware';
import { clampQuantity } from '@/shared/lib/pricing';

/**
 * All the cart remembers, in memory and in localStorage: which products and how many of each.
 * Names, photos and prices are looked up from the live menu (see hooks/useCart).
 */
export interface CartItem {
  productId: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  add: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  /** Drops items whose product is no longer on the menu. */
  removeMissing: (menuIds: ReadonlySet<string>) => void;
}

type PersistedCart = Pick<CartState, 'items'>;

/** Saves the cart to localStorage, and deletes the key altogether once the cart is empty. */
const cartStorage: PersistStorage<PersistedCart> = {
  getItem: (name) => {
    try {
      const raw = localStorage.getItem(name);
      return raw ? (JSON.parse(raw) as StorageValue<PersistedCart>) : null;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      if (value.state.items.length) localStorage.setItem(name, JSON.stringify(value));
      else localStorage.removeItem(name);
    } catch {
      // Storage can be full or blocked (private mode); the cart still works for this visit.
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      // Nothing to clean up if storage is unavailable.
    }
  },
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (productId, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((item) => item.productId === productId);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.productId === productId ? { ...item, quantity: clampQuantity(item.quantity + quantity) } : item,
              ),
            };
          }
          return { items: [...state.items, { productId, quantity: clampQuantity(quantity) }] };
        }),
      setQuantity: (productId, quantity) =>
        set((state) => {
          const next = clampQuantity(quantity);
          return {
            items:
              next === 0
                ? state.items.filter((item) => item.productId !== productId)
                : state.items.map((item) => (item.productId === productId ? { ...item, quantity: next } : item)),
          };
        }),
      remove: (productId) => set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),
      clear: () => set({ items: [] }),
      removeMissing: (menuIds) =>
        set((state) => {
          const items = state.items.filter((item) => menuIds.has(item.productId));
          return items.length === state.items.length ? state : { items };
        }),
    }),
    {
      name: 'sufra.cart',
      version: 2,
      storage: cartStorage,
      partialize: (state) => ({ items: state.items }),
      // Version 1 stored full lines (name, photo, price); keep only the id and quantity.
      migrate: (persisted, version) => {
        if (version < 2) {
          const lines = (persisted as { lines?: CartItem[] } | null)?.lines ?? [];
          return { items: lines.map(({ productId, quantity }) => ({ productId, quantity })) };
        }
        return persisted as PersistedCart;
      },
    },
  ),
);

export const useCartQuantity = (productId: string) =>
  useCartStore((state) => state.items.find((item) => item.productId === productId)?.quantity ?? 0);
