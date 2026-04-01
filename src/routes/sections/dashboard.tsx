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

// Dashboard
const DashboardOverview = lazy(() => import('src/pages/dashboard/overview'));
const OrderReceiveSummary = lazy(() => import('src/pages/orders/receive-summary'));
const OrderPaymentList = lazy(() => import('src/pages/orders/payment-list'));
const OrderPaymentSummary = lazy(() => import('src/pages/orders/payment-summary'));
const OrderCollectionRate = lazy(() => import('src/pages/orders/collection-rate'));

// Logs
const LogMessageRecord = lazy(() => import('src/pages/logs/message-record'));
const LogMerchantRequest = lazy(() => import('src/pages/logs/merchant-request'));
const LogRiskControl = lazy(() => import('src/pages/logs/risk-control'));

// Merchant
const MerchantInfo = lazy(() => import('src/pages/merchant/merchant-info'));

// Business
const BusinessMerchantBind = lazy(() => import('src/pages/business/merchant-bind'));
const BusinessDailySummary = lazy(() => import('src/pages/business/daily-summary'));
const BusinessMonthlySummary = lazy(() => import('src/pages/business/monthly-summary'));
const BusinessCustomerConsult = lazy(() => import('src/pages/business/customer-consult'));

// Fund
const FundSettlementList = lazy(() => import('src/pages/fund/settlement-list'));
const FundRechargeWithdraw = lazy(() => import('src/pages/fund/recharge-withdraw'));
const FundAccountSettlement = lazy(() => import('src/pages/fund/account-settlement'));
const FundMerchantDailySummary = lazy(() => import('src/pages/fund/merchant-daily-summary'));
const FundCountryDailySummary = lazy(() => import('src/pages/fund/country-daily-summary'));

// Config
const ConfigPaymentChannel = lazy(() => import('src/pages/config/payment-channel'));
const ConfigRouteStrategy = lazy(() => import('src/pages/config/route-strategy'));
const ConfigRiskControlRule = lazy(() => import('src/pages/config/risk-control-rule'));

// System
const SystemRoleManage = lazy(() => import('src/pages/system/role-manage'));
const SystemAccountManage = lazy(() => import('src/pages/system/account-manage'));

// Top-level pages
const SendAnnouncement = lazy(() => import('src/pages/system/send-announcement'));
const ExportManagement = lazy(() => import('src/pages/system/export-management'));

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
        path: 'dashboard',
        children: [{ path: 'overview', element: <DashboardOverview /> }],
      },
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
        path: 'merchant',
        children: [{ path: 'merchant-info', element: <MerchantInfo /> }],
      },
      {
        path: 'logs',
        children: [
          { path: 'message-record', element: <LogMessageRecord /> },
          { path: 'merchant-request', element: <LogMerchantRequest /> },
          { path: 'risk-control', element: <LogRiskControl /> },
        ],
      },
      {
        path: 'business',
        children: [
          { path: 'merchant-bind', element: <BusinessMerchantBind /> },
          { path: 'daily-summary', element: <BusinessDailySummary /> },
          { path: 'monthly-summary', element: <BusinessMonthlySummary /> },
          { path: 'customer-consult', element: <BusinessCustomerConsult /> },
        ],
      },
      {
        path: 'fund',
        children: [
          { path: 'settlement-list', element: <FundSettlementList /> },
          { path: 'recharge-withdraw', element: <FundRechargeWithdraw /> },
          { path: 'account-settlement', element: <FundAccountSettlement /> },
          { path: 'merchant-daily-summary', element: <FundMerchantDailySummary /> },
          { path: 'country-daily-summary', element: <FundCountryDailySummary /> },
        ],
      },
      {
        path: 'config',
        children: [
          { path: 'payment-channel', element: <ConfigPaymentChannel /> },
          { path: 'route-strategy', element: <ConfigRouteStrategy /> },
          { path: 'risk-control-rule', element: <ConfigRiskControlRule /> },
        ],
      },
      {
        path: 'system',
        children: [
          { path: 'role-manage', element: <SystemRoleManage /> },
          { path: 'account-manage', element: <SystemAccountManage /> },
        ],
      },
      { path: 'send-announcement', element: <SendAnnouncement /> },
      { path: 'export-management', element: <ExportManagement /> },
    ],
  },
];
