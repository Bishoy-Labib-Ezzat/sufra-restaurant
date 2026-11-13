import { calculateTotals } from '@/shared/lib/pricing';
import { ORDER_FLOW } from '@/shared/lib/order-status';
import type {
  DeliveryZone,
  FulfillmentType,
  Order,
  OrderItem,
  OrderStatus,
  OrderStatusChange,
  Product,
} from '@/shared/types';
import {
  seedAddressDetails,
  seedCustomers,
  seedLandmarks,
  seedNotes,
  seedStreets,
} from './people';
import { seedCategories } from './catalog';

const DRINK_CATEGORIES = new Set(seedCategories.filter((category) => category.kind === 'drink').map((category) => category.id));

const STAFF = ['Karim Adel', 'Nour Hassan'];
const MINUTE = 60_000;

/** Small deterministic PRNG so every fresh seed tells the same story. */
function createRandom(seed: number) {
  return () => {
    seed += 0x6d2b79f5;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Random = ReturnType<typeof createRandom>;
const pick = <T,>(random: Random, list: readonly T[]) => list[Math.floor(random() * list.length)];
const between = (random: Random, min: number, max: number) => min + Math.floor(random() * (max - min + 1));

interface Draft {
  createdAt: Date;
  /** Status the order should end up in. */
  status: OrderStatus;
  /** When set, history timestamps are squeezed into this many minutes after creation. */
  liveAgeMinutes?: number;
}

function buildItems(random: Random, products: Product[]): OrderItem[] {
  const available = products.filter((product) => product.isAvailable);
  const food = available.filter((product) => !DRINK_CATEGORIES.has(product.categoryId));
  const drinks = available.filter((product) => DRINK_CATEGORIES.has(product.categoryId));
  const chosen = new Map<string, Product>();
  const foodCount = between(random, 1, 3);
  for (let i = 0; i < foodCount; i++) {
    const product = pick(random, food);
    chosen.set(product.id, product);
  }
  if (random() < 0.7) {
    const drink = pick(random, drinks);
    chosen.set(drink.id, drink);
  }
  return [...chosen.values()].map((product) => {
    const quantity = random() < 0.7 ? 1 : between(random, 2, 3);
    return {
      productId: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      unitPrice: product.price,
      quantity,
      lineTotal: product.price * quantity,
    };
  });
}

function buildHistory(random: Random, draft: Draft, fulfillment: FulfillmentType): OrderStatusChange[] {
  const start = draft.createdAt.getTime();
  const history: OrderStatusChange[] = [{ status: 'new', at: draft.createdAt.toISOString(), by: null }];
  const staff = pick(random, STAFF);

  if (draft.status === 'cancelled') {
    const reviewedAt = start + between(random, 2, 5) * MINUTE;
    history.push({ status: 'reviewing', at: new Date(reviewedAt).toISOString(), by: staff });
    history.push({
      status: 'cancelled',
      at: new Date(reviewedAt + between(random, 4, 12) * MINUTE).toISOString(),
      by: staff,
      note: random() < 0.6 ? 'Customer did not answer the confirmation call.' : 'Customer asked to cancel.',
    });
    return history;
  }

  const steps = ORDER_FLOW.slice(1, ORDER_FLOW.indexOf(draft.status as (typeof ORDER_FLOW)[number]) + 1);
  const gaps: Record<string, [number, number]> = {
    reviewing: [1, 4],
    confirmed: [3, 8],
    preparing: [2, 5],
    ready: [12, 22],
    delivered: fulfillment === 'pickup' ? [4, 15] : [15, 35],
  };
  let at = start;
  steps.forEach((status, index) => {
    if (draft.liveAgeMinutes !== undefined) {
      // Spread the steps evenly so the newest change still lies in the past.
      at = start + ((index + 1) / (steps.length + 0.5)) * draft.liveAgeMinutes * MINUTE;
    } else {
      const [min, max] = gaps[status];
      at += between(random, min, max) * MINUTE;
    }
    history.push({ status, at: new Date(at).toISOString(), by: staff });
  });
  return history;
}

function buildOrder(random: Random, draft: Draft, products: Product[], zones: DeliveryZone[]): Order {
  const [name, phone] = pick(random, seedCustomers);
  const fulfillment: FulfillmentType = random() < 0.72 ? 'delivery' : 'pickup';
  const zone = fulfillment === 'delivery' ? pick(random, zones.slice(0, 8)) : null;
  const items = buildItems(random, products);
  const totals = calculateTotals(items, zone?.fee ?? 0);
  const history = buildHistory(random, draft, fulfillment);

  return {
    id: crypto.randomUUID(),
    code: '',
    status: draft.status,
    fulfillment,
    customer: { name, phone },
    address: zone
      ? {
          zoneId: zone.id,
          zoneName: zone.name,
          street: pick(random, seedStreets),
          details: pick(random, seedAddressDetails),
          landmark: pick(random, seedLandmarks),
        }
      : null,
    notes: pick(random, seedNotes),
    items,
    subtotal: totals.subtotal,
    deliveryFee: totals.deliveryFee,
    total: totals.total,
    createdAt: draft.createdAt.toISOString(),
    updatedAt: history[history.length - 1].at,
    history,
  };
}

/** A week of service: closed orders for past days, plus a live board for right now. */
export function createSeedOrders(products: Product[], zones: DeliveryZone[], now: Date): Order[] {
  const random = createRandom(20261113);
  const drafts: Draft[] = [];

  for (let daysAgo = 6; daysAgo >= 0; daysAgo--) {
    const day = new Date(now);
    day.setDate(now.getDate() - daysAgo);
    const isWeekend = day.getDay() === 4 || day.getDay() === 5;
    const count = between(random, 7, 11) + (isWeekend ? 4 : 0);

    for (let i = 0; i < count; i++) {
      const createdAt = new Date(day);
      createdAt.setHours(between(random, 12, 23), between(random, 0, 59), between(random, 0, 59), 0);
      // Today's closed orders must have finished well before now.
      if (daysAgo === 0 && createdAt.getTime() > now.getTime() - 100 * MINUTE) continue;
      drafts.push({ createdAt, status: random() < 0.07 ? 'cancelled' : 'delivered' });
    }
  }

  const live: [ageMinutes: number, status: OrderStatus][] = [
    [3, 'new'],
    [8, 'new'],
    [14, 'reviewing'],
    [23, 'confirmed'],
    [31, 'preparing'],
    [42, 'preparing'],
    [57, 'ready'],
  ];
  for (const [age, status] of live) {
    drafts.push({ createdAt: new Date(now.getTime() - age * MINUTE), status, liveAgeMinutes: age });
  }

  return drafts
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((draft, index) => ({ ...buildOrder(random, draft, products, zones), code: orderCode(1001 + index) }));
}

export const orderCode = (number: number) => `SF-${number}`;
