import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { categoriesService } from '@/shared/services/categories.service';
import { ordersService } from '@/shared/services/orders.service';
import { productsService } from '@/shared/services/products.service';
import type { ProductQuery } from '@/shared/types';

/** Catalog reads used by both the shop and the dashboard. */
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: ({ signal }) => categoriesService.list(signal),
    staleTime: 5 * 60_000,
  });
}

export function useProducts(query: ProductQuery = {}) {
  return useQuery({
    queryKey: queryKeys.products.list(query),
    queryFn: ({ signal }) => productsService.list(query, signal),
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.products.detail(id ?? ''),
    queryFn: ({ signal }) => productsService.get(id!, signal),
    enabled: Boolean(id),
  });
}

export function useDeliveryZones() {
  return useQuery({
    queryKey: queryKeys.deliveryZones,
    queryFn: ({ signal }) => ordersService.deliveryZones(signal),
    staleTime: 30 * 60_000,
  });
}
