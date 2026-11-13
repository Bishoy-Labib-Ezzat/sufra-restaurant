import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { isTerminal } from '@/shared/lib/order-status';
import { ordersService } from '@/shared/services/orders.service';
import type { CreateOrderRequest } from '@/shared/types';

export function usePlaceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateOrderRequest) => ordersService.place(request),
    onSuccess: (tracking) => {
      queryClient.setQueryData(queryKeys.orders.tracking(tracking.code), tracking);
      // Staff views in this browser should pick the new order up straight away.
      queryClient.invalidateQueries({ queryKey: ['orders', 'list'] });
    },
  });
}

/** Live order status for the customer. Polls until the order is closed. */
export function useTrackOrder(code: string | undefined) {
  return useQuery({
    queryKey: queryKeys.orders.tracking(code ?? ''),
    queryFn: ({ signal }) => ordersService.track(code!, signal),
    enabled: Boolean(code),
    refetchInterval: (query) => (query.state.data && isTerminal(query.state.data.status) ? false : 10_000),
  });
}
