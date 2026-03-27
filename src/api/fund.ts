import http from 'src/lib/http';

// ----------------------------------------------------------------------

// Types

export type SettlementListParams = {
  pageNum?: number;
  pageSize?: number;
  status?: string;
  type?: string;
  startTime?: string;
  endTime?: string;
};

export type RechargeWithdrawParams = {
  pageNum?: number;
  pageSize?: number;
  status?: string;
  type?: string;
  startTime?: string;
  endTime?: string;
};

export type DailySummaryParams = {
  pageNum?: number;
  pageSize?: number;
  startTime?: string;
  endTime?: string;
};

export type ApprovePayload = {
  merchantId: string;
  id: number;
  exchangeRate?: string;
  costRate?: string;
  rechargeAmount: number;
  finalAmount?: string | number;
  withdrawalType: string;
  type?: string;
  status: number;
  country?: string;
  withdrawalPass?: string;
  gauthcode?: string;
  remark?: string;
};

export type RechargeData = {
  currencyType: string;
  customerAppid: string;
  exchangeRate: number;
  finalAmount: number;
  rechargeAmount: number;
  rechargeKey: string;
  remark: string;
  gauthCode: string;
  userid?: number;
  country: string;
};

export type WithdrawData = {
  customerAppid: string;
  rechargeAmount: number;
  exchangeRate: number;
  currencyType: string;
  finalAmount: string;
  remark: string;
  rechargeKey: string;
  gauthCode: string;
  country: string;
};

// ----------------------------------------------------------------------

// Settlement records

export const getSettlementList = (params: SettlementListParams) =>
  http.get('/admin/bill/v1/getBillList', params);

// Recharge & Withdraw approval

export const getRechargeWithdrawList = (params: RechargeWithdrawParams) =>
  http.get('/admin/approval/getWithdrawalList', params);

export const approveWithdrawal = (data: ApprovePayload) =>
  http.post('/admin/approval/approveWithdrawal', data);

export const approveRecharge = (data: ApprovePayload) =>
  http.post('/admin/recharge/v1/approveRecharge', data);

// Account settlement

export const getAccountAmount = () => http.get('/admin/bill/v1/getAmountInformation');

export const addRechargeRecord = (data: RechargeData) =>
  http.post('/admin/bill/v1/addRechargeRecord', data);

export const addWithdraw = (data: WithdrawData) => http.post('/admin/bill/v1/addWithdraw', data);

export const updateExchangeRate = (data: { name: string; gauthCode: string; data: string }) =>
  http.post('/admin/bill/v1/setExchangeRate', data);

export const getExchangeRate = () => http.get('/admin/home/v1/getExchangeRate');

// Daily summaries

export const getMerchantDailySummary = (params: DailySummaryParams) =>
  http.get('/admin/financial/v1/findByPage', params);

export const getCountryDailySummary = (params: DailySummaryParams) =>
  http.get('/admin/financial/v1/findCountryByPage', params);

// Image download (for recharge vouchers)

export const getImg = (params: { mediaId: string; type: boolean }) =>
  http.get('/admin/common/getImg', params);

export const downloadImg = async (params: { mediaId: string; type: boolean }, filename: string) => {
  const url = await getImg(params);
  if (!url) return;
  const a = document.createElement('a');
  a.href = typeof url === 'string' ? url : '';
  a.download = filename;
  a.click();
};
