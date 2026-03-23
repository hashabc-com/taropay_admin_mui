import type { ResponseData } from 'src/lib/http';
import type { Country } from 'src/stores/country-store';
import type { Merchant } from 'src/stores/merchant-store';

import http from 'src/lib/http';

// ----------------------------------------------------------------------

export const getCountryList = () =>
  http.get<ResponseData<Country[]>>('/admin/home/v1/getCountryList');

export const getMerchantList = () =>
  http.get<ResponseData<Merchant[]>>('/admin/user/v1/getAllUserList');

export const getProductDict = () =>
  http.get<{ payinChannel: string[]; payoutChannel: string[] }>(
    '/admin/user/v1/getChannelTypeList'
  );

export const payOutNotify = (data: { transId: string; status: number }) =>
  http.get<ResponseData>('/admin/collection/payInNotify', data);

export const payInNotify = (data: { transId: string; status: number }) =>
  http.get<ResponseData>('/admin/disbursement/payOutNotify', data);

export const updateStatus = (data: FormData) =>
  http.post<ResponseData>('/admin/collection/payInStatusQuery', data);
