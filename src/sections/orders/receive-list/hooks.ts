import type { Order, OrderStats } from './types';
import type { OrderListParams } from 'src/api/order';

import useSWR from 'swr';
import { useMemo } from 'react';

import { useListSWRKey } from 'src/hooks/use-list-swr-key';
import { useConvertAmount } from 'src/hooks/use-convert-amount';
import { useSearchParamsObject } from 'src/hooks/use-list-search';

import { getOrderList, getCollectionOrderStats } from 'src/api/order';

// ----------------------------------------------------------------------

/** Shared field keys — used by both search (UI) and SWR hooks (data) */
export const FIELD_KEYS = [
  'referenceno',
  'transId',
  'mobile',
  'userName',
  'status',
  'pickupCenter',
  'startTime',
  'endTime',
] as const;

// ----------------------------------------------------------------------

const EMPTY_STATS: OrderStats = {
  allOrder: 0,
  successOrder: 0,
  failedOrder: 0,
  orderAmount: 0,
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

export function useOrderList() {
  const params = useSearchParamsObject(FIELD_KEYS) as OrderListParams;
  const convertAmount = useConvertAmount();

  const key = useListSWRKey('orders', 'receive-list', params);

  const { data, error, isLoading, isValidating, mutate } = useSWR(key, () => getOrderList(params), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const orders: Order[] = useMemo(
    () =>
      (data?.result?.listRecord || []).map((item: Order) => ({
        ...item,
        amount: convertAmount(item.amount, false),
        realAmount: convertAmount(item.realAmount || 0, false),
        serviceAmount: convertAmount(item.serviceAmount, false),
      })),
    [data, convertAmount]
  );
  const totalRecord: number = data?.result?.totalRecord || 0;

  return { orders, totalRecord, error, isLoading, isValidating, mutate, params };
}

// ----------------------------------------------------------------------

export function useOrderStats() {
  const params = useSearchParamsObject([
    'startTime',
    'endTime',
    'pickupCenter',
    'status',
    'userName',
  ] as const);
  const convertAmount = useConvertAmount();

  const key = useListSWRKey(
    'orders',
    'receive-stat',
    params.startTime,
    params.endTime,
    params.pickupCenter,
    params.status,
    params.userName
  );

  const { data, isLoading } = useSWR(
    key,
    () =>
      getCollectionOrderStats({
        startTime: params.startTime as string | undefined,
        endTime: params.endTime as string | undefined,
        userName: params.userName as string | undefined,
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
