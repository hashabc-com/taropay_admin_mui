import type { PaymentListParams } from 'src/api/order';
import type { OrderStats } from '../receive-list/types';

import useSWR from 'swr';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { useConvertAmount } from 'src/hooks/use-convert-amount';

import { useCountryStore } from 'src/stores/country-store';
import { useMerchantStore } from 'src/stores/merchant-store';
import { getPaymentLists, getDisbursementOrderStats } from 'src/api/order';

// ----------------------------------------------------------------------

export type PaymentOrder = {
  id?: number;
  companyName?: string;
  localTime?: string;
  localSuccessTime?: string;
  updateTime?: string;
  transactionReferenceNo?: string;
  certificateId?: string;
  transactionid?: string;
  mobile?: string;
  userName?: string;
  pickupCenter?: string;
  paymentCompany?: string;
  accountNumber?: string;
  amount?: number | string;
  serviceAmount?: number | string;
  status?: string;
  address?: string;
  referenceno?: string;
  transId?: string;
};

export const PAYMENT_STATUS_MAP: Record<
  string,
  { label: string; color: 'success' | 'info' | 'error' }
> = {
  '0': { label: '付款成功', color: 'success' },
  '1': { label: '待付款', color: 'info' },
  '2': { label: '付款失败', color: 'error' },
};

// ----------------------------------------------------------------------

function usePaymentListParams(): PaymentListParams {
  const [searchParams] = useSearchParams();

  return useMemo(
    () => ({
      pageNum: Number(searchParams.get('pageNum')) || 1,
      pageSize: Number(searchParams.get('pageSize')) || 10,
      refNo: searchParams.get('refNo') || undefined,
      transId: searchParams.get('transId') || undefined,
      mobile: searchParams.get('mobile') || undefined,
      userName: searchParams.get('userName') || undefined,
      status: searchParams.get('status') || undefined,
      accountNumber: searchParams.get('accountNumber') || undefined,
      startTime: searchParams.get('startTime') || undefined,
      endTime: searchParams.get('endTime') || undefined,
    }),
    [searchParams]
  );
}

export function usePaymentList() {
  const params = usePaymentListParams();
  const { selectedCountry } = useCountryStore();
  const { selectedMerchant } = useMerchantStore();
  const convertAmount = useConvertAmount();

  const key = selectedCountry
    ? ['orders', 'payment-list', params, selectedCountry.code, selectedMerchant?.appid]
    : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    () => getPaymentLists(params),
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  const orders: PaymentOrder[] = useMemo(
    () =>
      (data?.result?.listRecord || []).map((r: PaymentOrder, i: number) => ({
        ...r,
        id: r.id ?? i,
        amount: convertAmount(r.amount || 0, false),
        serviceAmount: convertAmount(r.serviceAmount || 0, false),
      })),
    [data, convertAmount]
  );
  const totalRecord: number = data?.result?.totalRecord || 0;

  return { orders, totalRecord, error, isLoading, isValidating, mutate, params };
}

export function usePaymentStats() {
  const [searchParams] = useSearchParams();
  const { selectedCountry } = useCountryStore();
  const { selectedMerchant } = useMerchantStore();

  const startTime = searchParams.get('startTime') || undefined;
  const endTime = searchParams.get('endTime') || undefined;

  const key = selectedCountry
    ? ['orders', 'payment-stat', startTime, endTime, selectedCountry.code, selectedMerchant?.appid]
    : null;

  const { data, isLoading } = useSWR(key, () => getDisbursementOrderStats({ startTime, endTime }), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const stats: OrderStats = useMemo(() => {
    const r = data?.result;
    if (r) {
      return {
        totalOrders: Number(r.allOrder) || 0,
        successOrders: Number(r.successOrder) || 0,
        successRate: (r.successRate ?? '0').replace('%', ''),
      };
    }
    return { totalOrders: 0, successOrders: 0, successRate: '0' };
  }, [data?.result]);

  return { stats, isLoading };
}
