// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
};

// ----------------------------------------------------------------------

export const paths = {
  // AUTH
  auth: {
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: '/dashboard',
    overview: '/dashboard/overview',
  },
  // ORDERS
  orders: {
    root: '/orders',
    receiveList: '/orders/receive-list',
    receiveSummary: '/orders/receive-summary',
    paymentList: '/orders/payment-list',
    paymentSummary: '/orders/payment-summary',
    collectionRate: '/orders/collection-rate',
  },
  // FUND
  fund: {
    root: '/fund',
    settlementList: '/fund/settlement-list',
    rechargeWithdraw: '/fund/recharge-withdraw',
    accountSettlement: '/fund/account-settlement',
    merchantDailySummary: '/fund/merchant-daily-summary',
    countryDailySummary: '/fund/country-daily-summary',
  },
  // MERCHANT
  merchant: {
    root: '/merchant',
    merchantInfo: '/merchant/merchant-info',
  },
  // BUSINESS
  business: {
    root: '/business',
    merchantBind: '/business/merchant-bind',
    dailySummary: '/business/daily-summary',
    monthlySummary: '/business/monthly-summary',
    customerConsult: '/business/customer-consult',
  },
  // LOGS
  logs: {
    root: '/logs',
    messageRecord: '/logs/message-record',
    merchantRequest: '/logs/merchant-request',
    riskControl: '/logs/risk-control',
  },
  // CONFIG
  config: {
    root: '/config',
    paymentChannel: '/config/payment-channel',
    routeStrategy: '/config/route-strategy',
    riskControlRule: '/config/risk-control-rule',
  },
  // SYSTEM
  system: {
    root: '/system',
    roleManage: '/system/role-manage',
    accountManage: '/system/account-manage',
  },
  // SEND ANNOUNCEMENT
  sendAnnouncement: '/send-announcement',
  // EXPORT MANAGEMENT
  exportManagement: '/export-management',
};
