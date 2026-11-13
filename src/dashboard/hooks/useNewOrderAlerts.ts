import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { setTitleBadge } from '@/shared/hooks/useDocumentTitle';
import { firstName, formatMoney } from '@/shared/lib/format';
import { ordersService } from '@/shared/services/orders.service';
import { toast } from '@/shared/ui/toast-store';
import { ORDERS_POLL_MS } from './orders';

const QUERY = { status: ['new' as const], pageSize: 50 };

/**
 * Watches for orders that arrive while the dashboard is open: announces each one,
 * and keeps the count in the tab title so a backgrounded tab still shows it.
 */
export function useNewOrderAlerts() {
  const navigate = useNavigate();
  const seen = useRef<Set<string> | null>(null);
  const { data } = useQuery({
    queryKey: queryKeys.orders.list(QUERY),
    queryFn: ({ signal }) => ordersService.list(QUERY, signal),
    refetchInterval: ORDERS_POLL_MS,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (!data) return;
    if (seen.current === null) {
      // The first load is the existing backlog, not news.
      seen.current = new Set(data.items.map((order) => order.id));
      return;
    }
    for (const order of data.items) {
      if (seen.current.has(order.id)) continue;
      seen.current.add(order.id);
      toast.info(`New order ${order.code} from ${firstName(order.customer.name)}, ${formatMoney(order.total)}`, {
        duration: 9000,
        action: { label: 'Open', onClick: () => navigate(`/dashboard/orders/${order.id}`) },
      });
    }
  }, [data, navigate]);

  const count = data?.total ?? 0;
  useEffect(() => {
    setTitleBadge(count);
    return () => setTitleBadge(0);
  }, [count]);

  return count;
}
