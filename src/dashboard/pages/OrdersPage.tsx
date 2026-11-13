import { useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router';
import { CaretLeft, CaretRight, Kanban, MagnifyingGlass, Rows } from '@phosphor-icons/react';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { ALL_STATUSES, OPEN_STATUSES, STATUS_META } from '@/shared/lib/order-status';
import { Button } from '@/shared/ui/Button';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Input, Segmented, Select } from '@/shared/ui/form';
import { ErrorState, LoadingRows, Skeleton } from '@/shared/ui/states';
import type { Order, OrderStatus } from '@/shared/types';
import { OrderBoard } from '../components/orders/OrderBoard';
import { OrdersTable } from '../components/orders/OrdersTable';
import { PageHeader } from '../components/PageHeader';
import { useOrdersList } from '../hooks/orders';
import { RANGE_OPTIONS, rangeToQuery, type RangePreset } from '../lib/order-range';

const PAGE_SIZE = 15;
type View = 'board' | 'list';

function useOpenOrder() {
  const navigate = useNavigate();
  const { search } = useLocation();
  return (order: Order) => navigate({ pathname: `/dashboard/orders/${order.id}`, search }, { preventScrollReset: true });
}

function BoardView() {
  const openOrder = useOpenOrder();
  const { data, error, isPending, refetch, isFetching } = useOrdersList({ status: OPEN_STATUSES, pageSize: 200 });

  if (isPending) {
    return (
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5" role="status" aria-label="Loading orders">
        {OPEN_STATUSES.map((status) => (
          <Skeleton key={status} className="h-96 rounded-panel" />
        ))}
      </div>
    );
  }
  if (error) return <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />;
  return <OrderBoard orders={data.items} onOpen={openOrder} />;
}

function ListView() {
  const openOrder = useOpenOrder();
  const [params, setParams] = useSearchParams();
  const status = (params.get('status') as OrderStatus | null) ?? undefined;
  const range = (params.get('range') as RangePreset | null) ?? '7d';
  const page = Number(params.get('page') ?? 1);
  const [search, setSearch] = useState(params.get('q') ?? '');
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const setParam = (key: string, value: string | undefined) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) next.set(key, value);
        else next.delete(key);
        if (key !== 'page') next.delete('page');
        return next;
      },
      { replace: true, preventScrollReset: true },
    );

  useEffect(() => {
    if (debouncedSearch !== (params.get('q') ?? '')) setParam('q', debouncedSearch || undefined);
    // Sync only when the typed value settles.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const query = useMemo(
    () => ({
      status: status ? [status] : undefined,
      search: params.get('q') ?? undefined,
      ...rangeToQuery(range),
      page,
      pageSize: PAGE_SIZE,
    }),
    [status, params, range, page],
  );
  const { data, error, isPending, isPlaceholderData, refetch, isFetching } = useOrdersList(query);
  const pages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;
  const filtered = Boolean(status || params.get('q') || range !== '7d');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <label className="relative md:w-80">
          <span className="sr-only">Search orders</span>
          <MagnifyingGlass size={18} weight="bold" aria-hidden className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Order number, name or phone"
            className="rounded-full pl-11"
          />
        </label>
        <div className="grid grid-cols-2 gap-3 md:flex">
          <Select aria-label="Status" value={status ?? ''} onChange={(event) => setParam('status', event.target.value || undefined)} className="rounded-full md:w-48">
            <option value="">All statuses</option>
            {ALL_STATUSES.map((item) => (
              <option key={item} value={item}>
                {STATUS_META[item].label}
              </option>
            ))}
          </Select>
          <Select aria-label="Date range" value={range} onChange={(event) => setParam('range', event.target.value)} className="rounded-full md:w-44">
            {RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isPending ? (
        <LoadingRows rows={8} />
      ) : error ? (
        <ErrorState error={error} onRetry={() => refetch()} retrying={isFetching} />
      ) : data.items.length === 0 ? (
        <EmptyState
          icon={MagnifyingGlass}
          title="No orders match"
          description="Try a wider date range or clear the filters."
          action={
            filtered && (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch('');
                  setParams((current) => {
                    const next = new URLSearchParams();
                    if (current.get('view')) next.set('view', current.get('view')!);
                    return next;
                  });
                }}
              >
                Clear filters
              </Button>
            )
          }
        />
      ) : (
        <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <OrdersTable orders={data.items} onOpen={openOrder} />
          <div className="mt-4 flex items-center justify-between gap-4 text-sm text-muted">
            <span>
              {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, data.total)} of {data.total} orders
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" icon={CaretLeft} disabled={page <= 1} onClick={() => setParam('page', String(page - 1))}>
                Newer
              </Button>
              <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => setParam('page', String(page + 1))}>
                Older
                <CaretRight size={16} weight="bold" aria-hidden />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function OrdersPage() {
  useDocumentTitle('Orders');
  const [params, setParams] = useSearchParams();
  const view: View = params.get('view') === 'list' ? 'list' : 'board';

  return (
    <>
      <PageHeader
        title="Orders"
        description={
          view === 'board'
            ? 'Open orders as tickets, oldest first. Move a ticket along with its button, or open it for details.'
            : 'Every order, including delivered and cancelled ones.'
        }
        actions={
          <Segmented<View>
            label="View"
            value={view}
            onChange={(next) => setParams(next === 'list' ? { view: 'list' } : {}, { preventScrollReset: true })}
            options={[
              { value: 'board', label: <><Kanban size={18} weight="bold" aria-hidden />Board</> },
              { value: 'list', label: <><Rows size={18} weight="bold" aria-hidden />List</> },
            ]}
          />
        }
      />
      {view === 'board' ? <BoardView /> : <ListView />}
      <Outlet />
    </>
  );
}
