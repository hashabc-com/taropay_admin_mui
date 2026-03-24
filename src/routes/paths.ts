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
  // LOGS
  logs: {
    root: '/logs',
    messageRecord: '/logs/message-record',
    merchantRequest: '/logs/merchant-request',
    riskControl: '/logs/risk-control',
  },
};
