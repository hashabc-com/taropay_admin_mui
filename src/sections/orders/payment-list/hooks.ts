import type { PaymentListParams } from 'src/api/order';
import type { OrderStats } from '../receive-list/types';

import useSWR from 'swr';
import { useMemo } from 'react';

import { useListSWRKey } from 'src/hooks/use-list-swr-key';
import { useConvertAmount } from 'src/hooks/use-convert-amount';
import { useSearchParamsObject } from 'src/hooks/use-list-search';

import { getPaymentLists, getDisbursementOrderStats } from 'src/api/order';

// ----------------------------------------------------------------------

const EMPTY_STATS: OrderStats = {
  allOrder: 0,
  successOrder: 0,
  failedOrder: 0,
  orderAmount: 0,
  serviceAmount: 0,
  successRate: '0',
  fiveMinuteSuccessRate: '0',
  tenMinuteSuccessRate: '0',
  fifteenMinuteSuccessRate: '0',
  thirtyMinuteSuccessRate: '0',
  oneHourSuccessRate: '0',
  todaySuccessRate: '0',
};

function normalizeRate(value: unknown) {
  const text = String(value ?? '0').trim();

  return text ? text.replace('%', '') : '0';
}

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
  country?: string;
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

/** Shared field keys — used by both search (UI) and SWR hooks (data) */
export const FIELD_KEYS = [
  'refNo',
  'transId',
  'mobile',
  'userName',
  'accountNumber',
  'status',
  'pickupCenter',
  'startTime',
  'endTime',
] as const;

// ----------------------------------------------------------------------

export function usePaymentList() {
  const params = useSearchParamsObject(FIELD_KEYS) as unknown as PaymentListParams;
  const convertAmount = useConvertAmount();

  const key = useListSWRKey('orders', 'payment-list', params);

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
  const params = useSearchParamsObject(['startTime', 'endTime', 'pickupCenter', 'status'] as const);
  const convertAmount = useConvertAmount();

  const key = useListSWRKey(
    'orders',
    'payment-stat',
    params.startTime,
    params.endTime,
    params.pickupCenter,
    params.status
  );

  const { data, isLoading } = useSWR(
    key,
    () =>
      getDisbursementOrderStats({
        startTime: params.startTime as string | undefined,
        endTime: params.endTime as string | undefined,
        pickupCenter: params.pickupCenter as string | undefined,
        status: params.status as string | undefined,
      }),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  const stats: OrderStats = useMemo(() => {
    const r = data?.result;
    if (r) {
      return {
        allOrder: Number(r.allOrder) || 0,
        successOrder: Number(r.successOrder) || 0,
        failedOrder: Number(r.failedOrder ?? r.failOrder) || 0,
        orderAmount: convertAmount(r.orderAmount ?? r.amountTotal ?? 0, false),
        serviceAmount: convertAmount(r.serviceAmount ?? r.amountServiceTotal ?? 0, false),
        successRate: normalizeRate(r.successRate),
        fiveMinuteSuccessRate: normalizeRate(r.fiveMinuteSuccessRate),
        tenMinuteSuccessRate: normalizeRate(r.tenMinuteSuccessRate),
        fifteenMinuteSuccessRate: normalizeRate(r.fifteenMinuteSuccessRate),
        thirtyMinuteSuccessRate: normalizeRate(r.thirtyMinuteSuccessRate),
        oneHourSuccessRate: normalizeRate(r.oneHourSuccessRate),
        todaySuccessRate: normalizeRate(r.todaySuccessRate),
      };
    }
    return EMPTY_STATS;
  }, [convertAmount, data?.result]);

  return { stats, isLoading };
}
