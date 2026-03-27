import http from 'src/lib/http';

// ----------------------------------------------------------------------

export interface MerchantInfoParams {
  pageNum?: number;
  pageSize?: number;
  startTime?: string;
  endTime?: string;
}

export interface MerchantInfo {
  id: number;
  account: string;
  companyName: string;
  country: string;
  appid: string;
  secretKey: string;
  status: number; // 0: 启用, 1: 禁用
  createTime: string;
  paymentCompany?: string;
  dealTime?: string;
  billCount?: number;
  amount?: number;
  serviceAmount?: number;
  totalAmount?: number;
  freezeType?: number;
  accountFreezeDay?: number | null;
  provice?: string;
  zipcode?: number | null;
  payoutServiceFee?: number | null;
  payoutServiceRate?: number | null;
  collectionServiceFee?: number | null;
  collectionServiceRate?: number | null;
  phoneNumber?: string | null;
  email?: string | null;
  mobile?: string | null;
  bankServiceFree?: number | null;
  callbackQueue?: string;
}

// ----------------------------------------------------------------------

/** 获取商户信息列表 */
export const getMerchantInfoList = (params: MerchantInfoParams) =>
  http.get('/admin/user/v1/getUserList', params);

/** 全部商户（下拉框） */
export const getAllCustomer = () => http.get('/admin/user/v1/getAllUserList');

/** 新增商户 */
export const addCustomer = (data: Record<string, unknown>) =>
  http.post('/admin/user/v1/addUser', data);

/** 更新用户信息 */
export const updateCustomer = (data: Record<string, unknown>) =>
  http.post('/admin/user/v1/updateUser', data);

/** 修改密码 */
export const updatePass = (data: FormData) => http.post('/admin/user/v1/updateUserPass', data);

/** 解绑Google验证 */
export const unbindGoogle = (data: FormData) =>
  http.post('/admin/deplop/v1/unbindGoogle', data, { autoAddMerchantId: false });

/** 添加IP */
export const addIP = (data: { merchantId: string; ip: string; googleCode: string }) =>
  http.post('/admin/deplop/v1/addIp', data);

/** 绑定TG群组 */
export const bindTgGroup = (data: FormData) =>
  http.post('/admin/user/v1/bindTgGroup', data, { autoAddCountry: false });

/** 获取商户费率 */
export const getMerchantRate = (params: { merchantId: string }) =>
  http.get('/admin/customerRate/getRateListByAppid', params, { autoAddMerchantId: false });

/** 更新商户费率 */
export const updateMerchantRate = (data: unknown[]) =>
  http.post('/admin/customerRate/update', data, {
    autoAddMerchantId: false,
    autoAddCountry: false,
  });

/** 获取渠道类型列表 */
export const getChannelTypeList = (country: string, channelCode?: string) =>
  http.get(
    '/admin/user/v1/getChannelTypeList',
    { country, channelCode },
    { autoAddCountry: false }
  );

/** 获取自动登录token */
export const getAutoLoginToken = (merchantId: string, googleCode: string) =>
  http.post(
    `/admin/user/v1/loginCustomerBackstage?merchantId=${merchantId}&gauthKey=${googleCode}`,
    {},
    { autoAddMerchantId: false, autoAddCountry: false }
  );

/** 获取回调队列组 */
export const getQueueGroup = () => http.get('/admin/user/v1/callbackQueueGroup');
