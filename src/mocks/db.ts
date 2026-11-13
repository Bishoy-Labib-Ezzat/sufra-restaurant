import type { Category, DeliveryZone, Order, Product, StaffUser } from '@/shared/types';
import { createSeedProducts, seedCategories } from './seed/catalog';
import { createSeedOrders } from './seed/orders';
import { seedUsers, seedZones } from './seed/people';

export type DbCategory = Omit<Category, 'productCount'>;
export interface DbUser extends StaffUser {
  password: string;
}
export interface DbSession {
  token: string;
  userId: string;
  expiresAt: string;
}

export interface DbData {
  version: number;
  seededAt: string;
  categories: DbCategory[];
  products: Product[];
  orders: Order[];
  zones: DeliveryZone[];
  users: DbUser[];
  sessions: DbSession[];
  lastOrderNumber: number;
}

const STORAGE_KEY = 'sufra.mock-db';
const VERSION = 1;

function createSeed(): DbData {
  const now = new Date();
  const products = createSeedProducts(now);
  const orders = createSeedOrders(products, seedZones, now);
  return {
    version: VERSION,
    seededAt: now.toISOString(),
    categories: seedCategories,
    products,
    orders,
    zones: seedZones,
    users: seedUsers,
    sessions: [],
    lastOrderNumber: 1000 + orders.length,
  };
}

function load(): DbData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw) as DbData;
      if (data.version === VERSION) return data;
    }
  } catch {
    // Corrupt storage falls through to a fresh seed.
  }
  const fresh = createSeed();
  persist(fresh);
  return fresh;
}

function persist(data: DbData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * A tiny table store kept in localStorage. Every call reads storage again, so the shop and the
 * dashboard see each other's writes even when they run in separate tabs.
 */
export const db = {
  read<T>(query: (data: Readonly<DbData>) => T): T {
    return query(load());
  },
  write<T>(mutation: (data: DbData) => T): T {
    const data = load();
    const result = mutation(data);
    persist(data);
    return result;
  },
};

/** Restores the demo data: catalog, a fresh week of orders and the demo accounts. */
export function resetMockDatabase() {
  persist(createSeed());
}
