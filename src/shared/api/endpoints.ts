/**
 * Single source of truth for the backend contract. Services build requests from these paths and
 * the mock backend registers its handlers on the same paths (passing ':id' style placeholders).
 */
export const endpoints = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  categories: {
    list: '/categories',
    detail: (id: string) => `/categories/${id}`,
    reorder: '/categories/reorder',
  },
  products: {
    list: '/products',
    detail: (id: string) => `/products/${id}`,
  },
  uploads: {
    image: '/uploads/images',
  },
  deliveryZones: '/delivery-zones',
  orders: {
    list: '/orders',
    detail: (id: string) => `/orders/${id}`,
    status: (id: string) => `/orders/${id}/status`,
    track: (code: string) => `/orders/track/${code}`,
  },
  stats: {
    overview: '/stats/overview',
  },
} as const;
