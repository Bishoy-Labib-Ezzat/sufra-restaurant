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

export const STATUS_META: Record<OrderStatus, StatusMeta> = {
  new: {
    label: 'New',
    action: 'Back to new',
    tone: { bg: 'bg-status-new-wash', text: 'text-status-new-ink', marker: 'bg-status-new' },
  },
  reviewing: {
    label: 'In review',
    action: 'Start review',
    tone: { bg: 'bg-status-review-wash', text: 'text-status-review-ink', marker: 'bg-status-review' },
  },
  confirmed: {
    label: 'Confirmed',
    action: 'Confirm order',
    tone: { bg: 'bg-status-confirmed-wash', text: 'text-status-confirmed-ink', marker: 'bg-status-confirmed' },
  },
  preparing: {
    label: 'Preparing',
    action: 'Send to kitchen',
    tone: { bg: 'bg-status-preparing-wash', text: 'text-status-preparing-ink', marker: 'bg-status-preparing' },
  },
  ready: {
    label: 'Ready',
    action: 'Mark ready',
    tone: { bg: 'bg-status-ready-wash', text: 'text-status-ready-ink', marker: 'bg-status-ready' },
  },
  delivered: {
    label: 'Delivered',
    action: 'Mark delivered',
    tone: { bg: 'bg-status-done-wash', text: 'text-status-done-ink', marker: 'bg-status-done' },
  },
  cancelled: {
    label: 'Cancelled',
    action: 'Cancel order',
    tone: { bg: 'bg-status-cancelled-wash', text: 'text-status-cancelled-ink', marker: 'bg-status-cancelled' },
  },
};

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
  if (next === 'delivered' && fulfillment === 'pickup') return 'Mark picked up';
  return STATUS_META[next].action;
}

/** Wording the customer sees while tracking an order. */
export function customerStatusCopy(status: OrderStatus, fulfillment: FulfillmentType) {
  const pickup = fulfillment === 'pickup';
  switch (status) {
    case 'new':
      return { title: 'Order received', body: 'Your order reached the restaurant.' };
    case 'reviewing':
      return { title: 'Being reviewed', body: 'We are checking your order and will call you shortly.' };
    case 'confirmed':
      return { title: 'Confirmed', body: 'You confirmed the details with us on the phone.' };
    case 'preparing':
      return { title: 'In the kitchen', body: 'The grill is on and your order is being prepared.' };
    case 'ready':
      return pickup
        ? { title: 'Ready for pickup', body: 'Your order is packed and waiting at the counter.' }
        : { title: 'Out for delivery', body: 'Your order left the kitchen with our rider.' };
    case 'delivered':
      return pickup
        ? { title: 'Picked up', body: 'Enjoy your meal.' }
        : { title: 'Delivered', body: 'Enjoy your meal.' };
    case 'cancelled':
      return { title: 'Cancelled', body: 'This order was cancelled.' };
  }
}
