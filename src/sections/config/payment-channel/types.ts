// ----------------------------------------------------------------------

export type PaymentChannel = {
  id: number;
  channelCode: string;
  channelName: string;
  channelDesc?: string | null;
  fundType: number; // 1=收款, 2=付款, 3=两用
  singleMinAmount?: number | null;
  singleMaxAmount?: number | null;
  dailyMaxAmount?: number | null;
  channelStatus: number; // 1=正常, 2=维护, 3=暂停
  costRate?: number | null;
  externalQuoteRate?: number | null;
  transProcessTime?: string | null;
  runTimeRange?: string | null;
  country?: string | null;
  balance?: number | null;
  createTime?: string;
  updateTime?: string;
  remark?: string | null;
};

export type PaymentSubChannel = {
  id: number;
  subChannelCode: string;
  subChannelName: string;
  channelCode: string;
  subChannelStatus: number; // 1=正常, 2=维护, 3=暂停
  type: number; // 1=代付, 2=代收
  country?: string | null;
  createTime?: string;
  updateTime?: string;
};
