import type { OrderQuery } from '@/shared/types';

export type RangePreset = 'today' | '7d' | '30d' | 'all';

export const RANGE_OPTIONS: { value: RangePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'all', label: 'All time' },
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
