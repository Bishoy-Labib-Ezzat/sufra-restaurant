import type { OrderStatus } from './order';

export interface PeriodTotals {
  revenue: number;
  orders: number;
  averageOrder: number;
}

export interface DashboardOverview {
  generatedAt: string;
  /** Delivered and in-progress orders count toward revenue; cancelled ones do not. */
  today: PeriodTotals;
  yesterday: PeriodTotals;
  openOrders: number;
  awaitingConfirmation: number;
  /** Last 7 days, oldest first, `date` as YYYY-MM-DD. */
  revenueByDay: { date: string; revenue: number; orders: number }[];
  /** Today, one entry per hour 0-23. */
  ordersByHour: { hour: number; orders: number }[];
  /** Today. */
  statusBreakdown: { status: OrderStatus; count: number }[];
  /** Last 7 days, best sellers first. */
  topProducts: { productId: string; name: string; imageUrl: string; quantity: number; revenue: number }[];
  /** Last 7 days. */
  fulfillmentSplit: { delivery: number; pickup: number };
}
