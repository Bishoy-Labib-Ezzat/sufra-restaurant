import type { OrderQuery, ProductQuery } from '@/shared/types';

/**
 * Query keys shared by the shop and the dashboard, so a change made in one
 * (e.g. hiding a product) invalidates the data the other one shows.
 */
export const queryKeys = {
  categories: ['categories'] as const,
  products: {
    all: ['products'] as const,
    list: (query: ProductQuery = {}) => ['products', 'list', query] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
  },
  deliveryZones: ['delivery-zones'] as const,
  orders: {
    all: ['orders'] as const,
    list: (query: OrderQuery = {}) => ['orders', 'list', query] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
    tracking: (code: string) => ['orders', 'tracking', code] as const,
  },
  stats: {
    overview: ['stats', 'overview'] as const,
  },
  auth: {
    me: ['auth', 'me'] as const,
  },
};
