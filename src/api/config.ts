import http from 'src/lib/http';

// ======================== 支付通道配置 API ========================

export interface PaymentChannelListParams {
  pageNum?: number;
  pageSize?: number;
  channelCode?: string;
  channelStatus?: number;
  fundType?: number;
  country?: string;
}

/** 获取支付通道列表 */
export const getPaymentChannelList = (params: PaymentChannelListParams) =>
  http.get('/admin/paymentChannel/list', params, { autoAddCountry: false });

/** 新增支付通道 */
export const addPaymentChannel = (data: Record<string, unknown>) =>
  http.post('/admin/paymentChannel/add', data, { autoAddCountry: false });

/** 更新支付通道 */
export const updatePaymentChannel = (data: Record<string, unknown>) =>
  http.post('/admin/paymentChannel/update', data, { autoAddCountry: false });

/** 更新支付通道状态 */
export const updatePaymentChannelStatus = (data: { id: number; channelStatus: number }) =>
  http.post('/admin/paymentChannel/updateStatus', data, { autoAddCountry: false });

/** 查询渠道余额 */
export const queryPaymentChannelBalance = (data: {
  id: number;
  gauthKey: string;
  channelCode: string;
  country: string;
}) => http.post('/admin/paymentChannel/queryBalance', data, { autoAddCountry: false });

// ======================== 子渠道配置 API ========================

/** 获取子渠道列表 */
export const getSubChannelList = (params: { channelCode: string }) =>
  http.get('/admin/paymentChannel/getSubChannelList', params, { autoAddCountry: false });

/** 添加子渠道 */
export const addSubChannel = (data: Record<string, unknown>) =>
  http.post('/admin/paymentChannel/addSubChannel', data, { autoAddCountry: false });

/** 删除子渠道 */
export const deleteSubChannel = (params: { id: number }) =>
  http.post('/admin/paymentChannel/delSubChannel', null, {
    params,
    autoAddCountry: false,
  });

/** 更新子渠道状态 */
export const updateSubChannelStatus = (data: { id: number; subChannelStatus: number }) =>
  http.post('/admin/paymentChannel/updateSubStatus', data, { autoAddCountry: false });

// ======================== 路由策略配置 API ========================

export interface RouteStrategyListParams {
  pageNum?: number;
  pageSize?: number;
  appid?: string;
}

/** 获取路由策略列表 */
export const getRouteStrategyList = (params: RouteStrategyListParams) =>
  http.get('/admin/paymentRouteConfig/list', params);

/** 添加/更新路由策略配置 */
export const addRouteStrategy = (data: Record<string, unknown>) =>
  http.post('/admin/paymentRouteConfig/saveOrUpdate', data);

/** 根据国家和支付类型获取支付方式 */
export const getPaymentMethods = (params: { country: string; type: string }) =>
  http.get('/admin/paymentRouteConfig/selectBySubChannelCodeGroup', params, {
    autoAddCountry: false,
  });

/** 根据国家、类型和支付方式获取支付渠道列表 */
export const getPaymentChannelsByMethod = (params: {
  country: string;
  type: string;
  subchannelcode: string;
  id?: number;
}) =>
  http.get('/admin/paymentRouteConfig/selectByChannelCode', params, {
    autoAddCountry: false,
  });

/** 更新路由策略状态 */
export const updateRouteStrategyStatus = (data: { id: number; status: string }) =>
  http.post('/admin/paymentRouteConfig/update', data, { autoAddCountry: false });

// ======================== 风控规则配置 API ========================

export interface RuleConfigListParams {
  pageNum?: number;
  pageSize?: number;
  ruleName?: string;
  sceneCode?: string;
  status?: string;
}

/** 获取风控规则配置列表 */
export const getRuleConfigList = (params: RuleConfigListParams) =>
  http.get('/admin/ruleConfig/list', params);

/** 创建规则配置 */
export const createRuleConfig = (data: Record<string, unknown>) =>
  http.post('/admin/ruleConfig/create', data);

/** 更新规则配置 */
export const updateRuleConfig = (data: Record<string, unknown>) =>
  http.post('/admin/ruleConfig/update', data);

/** 删除规则配置 */
export const deleteRuleConfig = (data: { id: number; gauthKey?: string }) =>
  http.post('/admin/ruleConfig/delete', data);
