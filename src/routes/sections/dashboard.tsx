import type { RouteObject } from 'react-router';

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard';

import { usePathname } from '../hooks';

// ----------------------------------------------------------------------

// Orders
const OrderReceiveList = lazy(() => import('src/pages/orders/receive-list'));
const OrderReceiveSummary = lazy(() => import('src/pages/orders/receive-summary'));
const OrderPaymentList = lazy(() => import('src/pages/orders/payment-list'));
const OrderPaymentSummary = lazy(() => import('src/pages/orders/payment-summary'));
const OrderCollectionRate = lazy(() => import('src/pages/orders/collection-rate'));

// Logs
const LogMessageRecord = lazy(() => import('src/pages/logs/message-record'));
const LogMerchantRequest = lazy(() => import('src/pages/logs/merchant-request'));
const LogRiskControl = lazy(() => import('src/pages/logs/risk-control'));

// ----------------------------------------------------------------------

function SuspenseOutlet() {
  const pathname = usePathname();
  return (
    <Suspense key={pathname} fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

const dashboardLayout = () => (
  <DashboardLayout>
    <SuspenseOutlet />
  </DashboardLayout>
);

export const dashboardRoutes: RouteObject[] = [
  {
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      {
        path: 'orders',
        children: [
          { path: 'receive-list', element: <OrderReceiveList /> },
          { path: 'receive-summary', element: <OrderReceiveSummary /> },
          { path: 'payment-list', element: <OrderPaymentList /> },
          { path: 'payment-summary', element: <OrderPaymentSummary /> },
          { path: 'collection-rate', element: <OrderCollectionRate /> },
        ],
      },
      {
        path: 'logs',
        children: [
          { path: 'message-record', element: <LogMessageRecord /> },
          { path: 'merchant-request', element: <LogMerchantRequest /> },
          { path: 'risk-control', element: <LogRiskControl /> },
        ],
      },
    ],
  },
];
