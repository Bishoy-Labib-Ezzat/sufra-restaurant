import { http, HttpResponse } from 'msw';
import { endpoints } from '@/shared/api/endpoints';
import { isSameDay } from '@/shared/lib/format';
import { ALL_STATUSES, OPEN_STATUSES } from '@/shared/lib/order-status';
import type { DashboardOverview, Order, PeriodTotals } from '@/shared/types';
import { db } from '../db';
import { api, requireUser, route } from '../utils';

const counted = (order: Order) => order.status !== 'cancelled';

function totals(orders: Order[]): PeriodTotals {
  const valid = orders.filter(counted);
  const revenue = valid.reduce((sum, order) => sum + order.total, 0);
  return { revenue, orders: valid.length, averageOrder: valid.length ? Math.round(revenue / valid.length) : 0 };
}

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export function buildOverview(orders: Order[], now = new Date()): DashboardOverview {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);

  const onDay = (day: Date) => orders.filter((order) => isSameDay(new Date(order.createdAt), day));
  const today = onDay(now);
  const week = orders.filter((order) => new Date(order.createdAt) >= weekStart);

  const revenueByDay = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + index);
    const { revenue, orders: count } = totals(onDay(day));
    return { date: dateKey(day), revenue, orders: count };
  });

  const ordersByHour = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    orders: today.filter((order) => new Date(order.createdAt).getHours() === hour).length,
  }));

  const productSales = new Map<string, DashboardOverview['topProducts'][number]>();
  for (const order of week.filter(counted)) {
    for (const item of order.items) {
      const entry = productSales.get(item.productId) ?? {
        productId: item.productId,
        name: item.name,
        imageUrl: item.imageUrl,
        quantity: 0,
        revenue: 0,
      };
      entry.quantity += item.quantity;
      entry.revenue += item.lineTotal;
      productSales.set(item.productId, entry);
    }
  }

  return {
    generatedAt: now.toISOString(),
    today: totals(today),
    yesterday: totals(onDay(yesterday)),
    openOrders: orders.filter((order) => OPEN_STATUSES.includes(order.status)).length,
    awaitingConfirmation: orders.filter((order) => order.status === 'new' || order.status === 'reviewing').length,
    revenueByDay,
    ordersByHour,
    statusBreakdown: ALL_STATUSES.map((status) => ({
      status,
      count: today.filter((order) => order.status === status).length,
    })),
    topProducts: [...productSales.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5),
    fulfillmentSplit: {
      delivery: week.filter((order) => counted(order) && order.fulfillment === 'delivery').length,
      pickup: week.filter((order) => counted(order) && order.fulfillment === 'pickup').length,
    },
  };
}

export const statsHandlers = [
  http.get(
    api(endpoints.stats.overview),
    route(({ request }) => {
      requireUser(request);
      return HttpResponse.json(db.read((data) => buildOverview(data.orders)));
    }),
  ),
];
