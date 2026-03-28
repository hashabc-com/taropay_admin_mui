import http from 'src/lib/http';

// ----------------------------------------------------------------------

// Types

export type BusinessBindParams = {
  pageNum?: number;
  pageSize?: number;
  userName?: string;
};

export type DailySummaryParams = {
  pageNum?: number;
  pageSize?: number;
  businessName?: string;
  startTime?: string;
  endTime?: string;
};

export type MonthlySummaryParams = {
  pageNum?: number;
  pageSize?: number;
  businessName?: string;
  startMonth?: string;
  endMonth?: string;
};

export type CustomerConsultParams = {
  pageNum?: number;
  pageSize?: number;
  contactPerson?: string;
  phone?: string;
  email?: string;
  company?: string;
};

export type UpdateBusinessBindPayload = {
  supervisorsName: string;
  supervisorsId: number;
  customerList: Array<{
    customerappId: string;
    country: string | null;
  }>;
};

export type AddCustomerPayload = {
  contactPerson: string;
  countryCode: string;
  phone: string;
  email?: string;
  company?: string;
  source?: string;
  country: string;
  consultContent?: string;
  remark?: string;
};

export type AddFollowRecordPayload = {
  customerId: number | string;
  followType: string;
  followContent: string;
  followResult: string;
  remark?: string;
};

export type ConfigureBusinessRatePayload = Array<{
  id?: string;
  businessId: number;
  payCode: string;
  rate: number;
  feeAmount: number;
  type: string;
  country: string;
  configType: number;
}>;

// ----------------------------------------------------------------------

// API functions

/** 获取商务绑定列表 */
export const getBusinessBindList = (params: BusinessBindParams) =>
  http.get('/admin/supervisorsCustomer/list', params);

/** 根据商务ID获取商户列表 */
export const getMerchantsByBusinessId = (params: { supervisorsId: number }) =>
  http.get('/admin/supervisorsCustomer/getCustomerListBySuperId', params);

/** 更新商务绑定 */
export const updateBusinessBind = (data: UpdateBusinessBindPayload) =>
  http.post('/admin/supervisorsCustomer/updateBatch', data);

/** 获取商务日汇总 */
export const getBusinessDaySummary = (params: DailySummaryParams) =>
  http.get('/admin/business/dailyReportList', params);

/** 获取商务月汇总 */
export const getBusinessMonthlySummary = (params: MonthlySummaryParams) =>
  http.get('/admin/business/monthlyReportList', params);

/** 获取商务费率 */
export const getBusinessRate = (businessId: number | string) =>
  http.get(
    '/admin/costRateConfig/getBusinessRateListByAppid',
    { businessId },
    { autoAddMerchantId: false }
  );

/** 配置商务费率 */
export const configureBusinessRate = (data: ConfigureBusinessRatePayload) =>
  http.post('/admin/costRateConfig/saveOrUpdate', data, {
    autoAddMerchantId: false,
    autoAddCountry: false,
  });

/** 获取客户咨询列表 */
export const getCustomerConsultList = (params: CustomerConsultParams) =>
  http.get('/admin/customerInfoFollowUp/getList', params);

/** 新增客户咨询 */
export const addCustomerConsult = (data: AddCustomerPayload) =>
  http.post('/admin/customerInfoFollowUp/save', data);

/** 获取客户跟进记录列表 */
export const getFollowRecordList = (customerId: number | string) =>
  http.get('/admin/customerInfoFollowUp/getCustomerFollowRecordList', { customerId });

/** 新增跟进记录 */
export const addFollowRecord = (data: AddFollowRecordPayload) =>
  http.post('/admin/customerInfoFollowUp/saveCustomerFollowRecord', data);
