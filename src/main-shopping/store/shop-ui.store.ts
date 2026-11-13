import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ShopUiState {
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
}

export const useShopUi = create<ShopUiState>((set) => ({
  cartOpen: false,
  setCartOpen: (cartOpen) => set({ cartOpen }),
}));

interface RecentOrdersState {
  /** Most recent first. */
  codes: string[];
  remember: (code: string) => void;
}

/** Order numbers placed from this browser, so customers can get back to tracking. */
export const useRecentOrders = create<RecentOrdersState>()(
  persist(
    (set) => ({
      codes: [],
      remember: (code) => set((state) => ({ codes: [code, ...state.codes.filter((item) => item !== code)].slice(0, 5) })),
    }),
    { name: 'sufra.recent-orders', version: 1 },
  ),
);
