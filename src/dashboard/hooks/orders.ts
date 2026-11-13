import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/shared/api/errors';
import { queryKeys } from '@/shared/api/query-keys';
import { STATUS_META } from '@/shared/lib/order-status';
import { ordersService } from '@/shared/services/orders.service';
import { toast } from '@/shared/ui/toast-store';
import type { Order, OrderQuery, OrderStatus, Paginated } from '@/shared/types';

/** Orders change from the outside (customers), so staff views poll. */
export const ORDERS_POLL_MS = 10_000;

export function useOrdersList(query: OrderQuery, options: { poll?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.orders.list(query),
    queryFn: ({ signal }) => ordersService.list(query, signal),
    placeholderData: keepPreviousData,
    refetchInterval: options.poll === false ? false : ORDERS_POLL_MS,
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id ?? ''),
    queryFn: ({ signal }) => ordersService.get(id!, signal),
    enabled: Boolean(id),
    refetchInterval: ORDERS_POLL_MS,
  });
}

interface StatusChange {
  order: Pick<Order, 'id' | 'code'>;
  status: OrderStatus;
  note?: string;
}

/**
 * Moves an order to a new status. The change is applied to every cached view immediately,
 * so tickets jump lanes without waiting for the server, and rolls back if the server refuses.
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ order, status, note }: StatusChange) => ordersService.updateStatus(order.id, { status, note }),
    onMutate: async ({ order, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.orders.all });
      const lists = queryClient.getQueriesData<Paginated<Order>>({ queryKey: ['orders', 'list'] });
      const detail = queryClient.getQueryData<Order>(queryKeys.orders.detail(order.id));
      const patch = (item: Order): Order =>
        item.id === order.id ? { ...item, status, updatedAt: new Date().toISOString() } : item;

      lists.forEach(([key, data]) => {
        if (data) queryClient.setQueryData<Paginated<Order>>(key, { ...data, items: data.items.map(patch) });
      });
      if (detail) queryClient.setQueryData(queryKeys.orders.detail(order.id), patch(detail));
      return { lists, detail };
    },
    onError: (error, { order }, context) => {
      context?.lists.forEach(([key, data]) => queryClient.setQueryData(key, data));
      if (context?.detail) queryClient.setQueryData(queryKeys.orders.detail(order.id), context.detail);
      toast.error(getErrorMessage(error));
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.orders.detail(updated.id), updated);
      toast.success(`${updated.code} is now ${STATUS_META[updated.status].label.toLowerCase()}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.overview });
    },
  });
}
