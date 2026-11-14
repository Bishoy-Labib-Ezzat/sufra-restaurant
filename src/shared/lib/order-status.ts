import { t, toArabicDigits } from '@/shared/i18n';
import type { FulfillmentType, OrderStatus } from '@/shared/types';

/** The happy path an order travels through. `cancelled` can branch off any step before delivery. */
export const ORDER_FLOW = ['new', 'reviewing', 'confirmed', 'preparing', 'ready', 'delivered'] as const;

export const ALL_STATUSES: OrderStatus[] = [...ORDER_FLOW, 'cancelled'];
export const OPEN_STATUSES: OrderStatus[] = ['new', 'reviewing', 'confirmed', 'preparing', 'ready'];
export const TERMINAL_STATUSES: OrderStatus[] = ['delivered', 'cancelled'];

export const isTerminal = (status: OrderStatus) => TERMINAL_STATUSES.includes(status);

interface StatusMeta {
  label: string;
  /** Verb on the button that moves an order *into* this status. */
  action: string;
  /** Tailwind classes for badges: wash background, readable text, solid marker. */
  tone: { bg: string; text: string; marker: string };
}

const TONES: Record<OrderStatus, StatusMeta['tone']> = {
  new: { bg: 'bg-status-new-wash', text: 'text-status-new-ink', marker: 'bg-status-new' },
  reviewing: { bg: 'bg-status-review-wash', text: 'text-status-review-ink', marker: 'bg-status-review' },
  confirmed: { bg: 'bg-status-confirmed-wash', text: 'text-status-confirmed-ink', marker: 'bg-status-confirmed' },
  preparing: { bg: 'bg-status-preparing-wash', text: 'text-status-preparing-ink', marker: 'bg-status-preparing' },
  ready: { bg: 'bg-status-ready-wash', text: 'text-status-ready-ink', marker: 'bg-status-ready' },
  delivered: { bg: 'bg-status-done-wash', text: 'text-status-done-ink', marker: 'bg-status-done' },
  cancelled: { bg: 'bg-status-cancelled-wash', text: 'text-status-cancelled-ink', marker: 'bg-status-cancelled' },
};

/** Labels and button verbs come from i18n/ar.json (`status`). */
export const STATUS_META = Object.fromEntries(
  ALL_STATUSES.map((status) => [status, { ...t.status[status], tone: TONES[status] }]),
) as Record<OrderStatus, StatusMeta>;

export function nextStatus(status: OrderStatus): OrderStatus | null {
  const index = ORDER_FLOW.indexOf(status as (typeof ORDER_FLOW)[number]);
  if (index === -1 || index === ORDER_FLOW.length - 1) return null;
  return ORDER_FLOW[index + 1];
}

/** Closed orders stay closed; open orders can move to any other status, including back a step. */
export function canTransition(from: OrderStatus, to: OrderStatus) {
  return from !== to && !isTerminal(from);
}

/** Label for the primary button that advances an order, adjusted for pickup orders. */
export function advanceLabel(status: OrderStatus, fulfillment: FulfillmentType) {
  const next = nextStatus(status);
  if (!next) return null;
  if (next === 'delivered' && fulfillment === 'pickup') return t.status.markPickedUp;
  return STATUS_META[next].action;
}

/** Wording the customer sees while tracking an order. */
export function customerStatusCopy(status: OrderStatus, fulfillment: FulfillmentType) {
  const pickup = fulfillment === 'pickup';
  const copy = t.status.customer;
  switch (status) {
    case 'new':
    case 'reviewing':
    case 'confirmed':
    case 'preparing':
    case 'cancelled':
      return copy[status];
    case 'ready':
      return pickup ? copy.readyPickup : copy.readyDelivery;
    case 'delivered':
      return pickup ? copy.deliveredPickup : copy.deliveredDelivery;
  }
}

/** Order numbers are stored as "SF-1042"; people see just the number, in Arabic digits: "١٠٤٢". */
export const formatOrderCode = (code: string) => toArabicDigits(code.replace(/^SF-/i, ''));
