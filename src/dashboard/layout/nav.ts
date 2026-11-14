import { BowlFood, Receipt, SquaresFour, Tag, type Icon } from '@phosphor-icons/react';
import type { Permission } from '@/shared/auth/permissions';
import { t } from '@/shared/i18n';

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
  { to: '/dashboard', label: t.dashboard.nav.overview, icon: SquaresFour, end: true },
  { to: '/dashboard/orders', label: t.dashboard.nav.orders, icon: Receipt, showNewOrders: true },
  { to: '/dashboard/menu', label: t.dashboard.nav.menu, icon: BowlFood, permission: 'menu:manage' },
  { to: '/dashboard/categories', label: t.dashboard.nav.categories, icon: Tag, permission: 'menu:manage' },
];
