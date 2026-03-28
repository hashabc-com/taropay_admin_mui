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
};
