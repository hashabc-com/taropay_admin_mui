import http from 'src/lib/http';

// ----------------------------------------------------------------------
// Message Record
// ----------------------------------------------------------------------

export interface MessageRecordParams {
  pageNum: number;
  pageSize: number;
  messageId?: string;
  correlationId?: string;
  queueName?: string;
  consumerService?: string;
  consumeStatus?: string;
}

export const getMessageRecordList = (params: MessageRecordParams) =>
  http.get('/admin/consumeRecord/page', params);

export const addConsumeRecord = (data: { jsonMessage: string; gauthCode: string }) =>
  http.post('/admin/consumeRecord/add', data);

// ----------------------------------------------------------------------
// Merchant Request
// ----------------------------------------------------------------------

export interface MerchantRequestParams {
  pageNum: number;
  pageSize: number;
  transactionId?: string;
  transactionType?: string;
  status?: string;
}

export const getMerchantRequestList = (params: MerchantRequestParams) =>
  http.get('/admin/recordTransactionLog/page', params);

export const getTransactionLogByTransId = (params: { type: number; transId: string }) =>
  http.get('/admin/recordTransactionLog/getByTransId', params);

// ----------------------------------------------------------------------
// Risk Control
// ----------------------------------------------------------------------

export interface RiskControlParams {
  pageNum: number;
  pageSize: number;
  ruleName?: string;
  businessType?: string;
}

export const getRiskControlRecordList = (params: RiskControlParams) =>
  http.get('/admin/ruleLog/list', params);
