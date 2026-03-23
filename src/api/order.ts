import http from 'src/lib/http';

// ----------------------------------------------------------------------

export interface OrderListParams {
  pageNum: number;
  pageSize: number;
  country?: string;
  referenceno?: string;
  tripartiteOrder?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
  transId?: string;
  mobile?: string;
  userName?: string;
  pickupCenter?: string;
}

export const getOrderList = (params: OrderListParams) =>
  http.get('/admin/collection/v1/list', params);

export const getCollectionOrderStats = (params: { startTime?: string; endTime?: string }) =>
  http.get('/admin/collection/orderdata', params);
