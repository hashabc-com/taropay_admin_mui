import type { Order, OrderStats } from './types';
import type { OrderListParams } from 'src/api/order';

import useSWR from 'swr';
import { useMemo } from 'react';

import { useConvertAmount } from 'src/hooks/use-convert-amount';
import { useSearchParamsObject } from 'src/hooks/use-list-search';

import { useCountryStore } from 'src/stores/country-store';
import { useMerchantStore } from 'src/stores/merchant-store';
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

export function useOrderList() {
  const params = useSearchParamsObject(FIELD_KEYS) as OrderListParams;
  const { selectedCountry } = useCountryStore();
  const { selectedMerchant } = useMerchantStore();
  const convertAmount = useConvertAmount();

  const key = selectedCountry ? ['orders', 'receive-list', params, selectedMerchant?.appid] : null;

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
  const params = useSearchParamsObject(['startTime', 'endTime', 'pickupCenter', 'status'] as const);
  const { selectedCountry } = useCountryStore();
  const { selectedMerchant } = useMerchantStore();

  const key = selectedCountry
    ? [
        'orders',
        'receive-stat',
        params.startTime,
        params.endTime,
        params.pickupCenter,
        params.status,
        selectedMerchant?.appid,
      ]
    : null;

  const { data, isLoading } = useSWR(
    key,
    () =>
      getCollectionOrderStats({
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
        totalOrders: Number(r.allOrder) || 0,
        successOrders: Number(r.successOrder) || 0,
        successRate: (r.successRate ?? '0').replace('%', ''),
      };
    }
    return { totalOrders: 0, successOrders: 0, successRate: '0' };
  }, [data?.result]);

  return { stats, isLoading };
}
