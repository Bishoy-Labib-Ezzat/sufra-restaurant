import { t } from '@/shared/i18n';
import type { OrderQuery } from '@/shared/types';

export type RangePreset = 'today' | '7d' | '30d' | 'all';

export const RANGE_OPTIONS: { value: RangePreset; label: string }[] = [
  { value: 'today', label: t.dashboard.orders.ranges.today },
  { value: '7d', label: t.dashboard.orders.ranges['7d'] },
  { value: '30d', label: t.dashboard.orders.ranges['30d'] },
  { value: 'all', label: t.dashboard.orders.ranges.all },
];

/** Converts a preset into the `from` bound the API expects. */
export function rangeToQuery(range: RangePreset, now = new Date()): Pick<OrderQuery, 'from'> {
  if (range === 'all') return {};
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (range === '7d') start.setDate(start.getDate() - 6);
  if (range === '30d') start.setDate(start.getDate() - 29);
  return { from: start.toISOString() };
}
