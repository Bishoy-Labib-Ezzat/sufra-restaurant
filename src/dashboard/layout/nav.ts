import { BowlFood, Receipt, SquaresFour, Tag, type Icon } from '@phosphor-icons/react';
import type { Permission } from '@/shared/auth/permissions';

export interface NavItem {
  to: string;
  label: string;
  icon: Icon;
  end?: boolean;
  permission?: Permission;
  /** Shows the live count of new orders. */
  showNewOrders?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Overview', icon: SquaresFour, end: true },
  { to: '/dashboard/orders', label: 'Orders', icon: Receipt, showNewOrders: true },
  { to: '/dashboard/menu', label: 'Menu items', icon: BowlFood, permission: 'menu:manage' },
  { to: '/dashboard/categories', label: 'Categories', icon: Tag, permission: 'menu:manage' },
];
