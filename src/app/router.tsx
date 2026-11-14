import { createBrowserRouter } from 'react-router';
import { DashboardRoot } from '@/dashboard/DashboardRoot';
import { CheckoutPage } from '@/main-shopping/pages/CheckoutPage';
import { HomePage } from '@/main-shopping/pages/HomePage';
import { MenuPage } from '@/main-shopping/pages/MenuPage';
import { OrderPage } from '@/main-shopping/pages/OrderPage';
import { TrackOrderPage } from '@/main-shopping/pages/TrackOrderPage';
import { ShopLayout } from '@/main-shopping/layout/ShopLayout';
import { t } from '@/shared/i18n';
import { lazyNamed } from './lazy';
import { NotFoundPage } from './pages/NotFoundPage';
import { RootLayout } from './RootLayout';
import { RouteErrorPage } from './pages/RouteErrorPage';

// The dashboard is split out so customers never download it.
const LoginPage = lazyNamed(() => import('@/dashboard/pages/LoginPage'), 'LoginPage');
const ProtectedDashboard = lazyNamed(() => import('@/dashboard/layout/ProtectedDashboard'), 'ProtectedDashboard');
const OverviewPage = lazyNamed(() => import('@/dashboard/pages/OverviewPage'), 'OverviewPage');
const OrdersPage = lazyNamed(() => import('@/dashboard/pages/OrdersPage'), 'OrdersPage');
const OrderPanelRoute = lazyNamed(() => import('@/dashboard/pages/OrderPanelRoute'), 'OrderPanelRoute');
const MenuItemsPage = lazyNamed(() => import('@/dashboard/pages/MenuItemsPage'), 'MenuItemsPage');
const ProductEditorPage = lazyNamed(() => import('@/dashboard/pages/ProductEditorPage'), 'ProductEditorPage');
const CategoriesPage = lazyNamed(() => import('@/dashboard/pages/CategoriesPage'), 'CategoriesPage');

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: '/',
        element: <ShopLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'menu', element: <MenuPage /> },
          { path: 'checkout', element: <CheckoutPage /> },
          { path: 'order/:code', element: <OrderPage /> },
          { path: 'track', element: <TrackOrderPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
      {
        path: '/dashboard',
        element: <DashboardRoot />,
        children: [
          { path: 'login', element: <LoginPage /> },
          {
            element: <ProtectedDashboard />,
            children: [
              { index: true, element: <OverviewPage /> },
              {
                path: 'orders',
                element: <OrdersPage />,
                children: [{ path: ':orderId', element: <OrderPanelRoute /> }],
              },
              { path: 'menu', element: <MenuItemsPage /> },
              { path: 'menu/new', element: <ProductEditorPage /> },
              { path: 'menu/:productId', element: <ProductEditorPage /> },
              { path: 'categories', element: <CategoriesPage /> },
              { path: '*', element: <NotFoundPage homeHref="/dashboard" homeLabel={t.pages.notFound.dashboardHome} /> },
            ],
          },
        ],
      },
    ],
  },
]);
