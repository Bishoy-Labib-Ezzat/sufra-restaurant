import { Outlet } from 'react-router';
import { CartDrawer } from '../components/cart/CartDrawer';
import { ProductDialog } from '../components/menu/ProductDialog';
import { t } from '@/shared/i18n';
import { useCartMenuSync } from '../hooks/useCart';
import { MobileCartBar } from './MobileCartBar';
import { ShopFooter } from './ShopFooter';
import { ShopHeader } from './ShopHeader';

export function ShopLayout() {
  useCartMenuSync();

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-ink px-4 py-2 text-paper focus:not-sr-only focus:fixed focus:top-3 focus:start-3"
      >
        {t.shop.skipToContent}
      </a>
      <ShopHeader />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <ShopFooter />
      <CartDrawer />
      <ProductDialog />
      <MobileCartBar />
    </div>
  );
}
