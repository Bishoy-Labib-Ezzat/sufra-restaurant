import { apiClient } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type {
  CreateOrderRequest,
  DeliveryZone,
  Order,
  OrderQuery,
  OrderTracking,
  Paginated,
  UpdateOrderStatusRequest,
} from '@/shared/types';

export const ordersService = {
  // Customer-facing
  deliveryZones: (signal?: AbortSignal) => apiClient.get<DeliveryZone[]>(endpoints.deliveryZones, { signal }),
  place: (request: CreateOrderRequest) => apiClient.post<OrderTracking>(endpoints.orders.list, request),
  track: (code: string, signal?: AbortSignal) =>
    apiClient.get<OrderTracking>(endpoints.orders.track(code), { signal }),

  // Staff-facing
  list: (query: OrderQuery = {}, signal?: AbortSignal) =>
    apiClient.get<Paginated<Order>>(endpoints.orders.list, { query: { ...query }, signal }),
  get: (id: string, signal?: AbortSignal) => apiClient.get<Order>(endpoints.orders.detail(id), { signal }),
  updateStatus: (id: string, request: UpdateOrderStatusRequest) =>
    apiClient.patch<Order>(endpoints.orders.status(id), request),
};
