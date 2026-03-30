// ----------------------------------------------------------------------

export type RouteStrategy = {
  id: number;
  appid: string;
  customerName?: string;
  routeName?: string;
  country: string;
  paymentType: string; // "1": 代付, "2": 代收
  productCode: string; // 支付方式：QRIS、DANA等
  routeStrategy: string; // "1": 权重路由, "2": 成本优先
  enableFallback?: string;
  maxRetry?: number;
  status: string; // "0": 启用, "1": 禁用
  priority?: number;
  createTime?: string;
  updateTime?: string;
  paymentRouteChannelWeightList?: Array<{
    paymentPlatform: string;
    weight?: number;
    id?: number;
  }>;
};

export type PaymentChannelOption = {
  id: number;
  subChannelCode: string;
  subChannelName: string;
  channelCode: string;
  subChannelStatus: number;
  type: number;
  country: string;
  createTime?: string;
  updateTime?: string;
  weightId?: number | null;
  weight?: number;
};
