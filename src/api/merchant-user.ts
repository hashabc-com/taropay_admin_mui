import http from 'src/lib/http';

// ----------------------------------------------------------------------

export interface MerchantUser {
  id: number;
  account: string;
  accountName: string;
  email: string;
  status: number; // 0=启用 1=禁用
  appids: string;
  remark: string;
  createTime: string;
  updateTime: string;
}

export interface MerchantUserListParams {
  pageNum?: number;
  pageSize?: number;
  account?: string;
  status?: string;
}

export interface MerchantUserCreateData {
  account: string;
  accountName: string;
  email: string;
  password: string;
  appids?: string;
  remark?: string;
  gauthKey: string;
}

export interface MerchantUserUpdateData {
  id: number;
  accountName: string;
  email: string;
  password?: string;
  appids?: string;
  remark?: string;
  gauthKey: string;
}

// ----------------------------------------------------------------------

/** 主登录账号分页列表 */
export const getMerchantUserList = (params: MerchantUserListParams) =>
  http.get('/admin/merchantUser/v1/list', params);

/** 账号详情 */
export const getMerchantUserDetail = (id: number) =>
  http.get(
    '/admin/merchantUser/v1/detail',
    { id },
    { autoAddCountry: false, autoAddMerchantId: false }
  );

/** 创建主登录账号 */
export const createMerchantUser = (data: MerchantUserCreateData) =>
  http.post('/admin/merchantUser/v1/create', data, {
    autoAddCountry: false,
    autoAddMerchantId: false,
  });

/** 修改主登录账号 */
export const updateMerchantUser = (data: MerchantUserUpdateData) =>
  http.post('/admin/merchantUser/v1/update', data, {
    autoAddCountry: false,
    autoAddMerchantId: false,
  });

/** 启用/禁用账号 */
export const updateMerchantUserStatus = (data: { id: number; status: number }) =>
  http.post('/admin/merchantUser/v1/updateStatus', data, {
    autoAddCountry: false,
    autoAddMerchantId: false,
  });

/** 获取所有商户列表（不依赖country） */
export const getAllUserList = () =>
  http.get(
    '/admin/user/v1/getAllUserList',
    {},
    { autoAddCountry: false, autoAddMerchantId: false }
  );

/** 主账号一键登录商户后台 */
export const autoLoginMerchantUser = (account: string, gauthKey: string) =>
  http.post(
    `/admin/user/v1/loginCustomerBackstage?account=${encodeURIComponent(account)}&gauthKey=${encodeURIComponent(gauthKey)}`,
    {},
    { autoAddCountry: false, autoAddMerchantId: false }
  );
