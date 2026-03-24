import type { Order, OrderStats } from './types';

import useSWR from 'swr';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { useConvertAmount } from 'src/hooks/use-convert-amount';

import { useCountryStore } from 'src/stores/country-store';
import { useMerchantStore } from 'src/stores/merchant-store';
import { getOrderList, getCollectionOrderStats } from 'src/api/order';

// ----------------------------------------------------------------------

/**
 * Build query params from URL search params, falling back to sensible defaults.
 */
function useOrderParams() {
  const [searchParams] = useSearchParams();

  return useMemo(() => {
    const pageNum = Number(searchParams.get('pageNum')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
    const referenceno = searchParams.get('referenceno') || undefined;
    const transId = searchParams.get('transId') || undefined;
    const mobile = searchParams.get('mobile') || undefined;
    const userName = searchParams.get('userName') || undefined;
    const status = searchParams.get('status') || undefined;
    const pickupCenter = searchParams.get('pickupCenter') || undefined;
    const startTime = searchParams.get('startTime') || undefined;
    const endTime = searchParams.get('endTime') || undefined;

    return {
      pageNum,
      pageSize,
      referenceno,
      transId,
      mobile,
      userName,
      status,
      pickupCenter,
      startTime,
      endTime,
    };
  }, [searchParams]);
}

// ----------------------------------------------------------------------

export function useOrderList() {
  const params = useOrderParams();
  const { selectedCountry } = useCountryStore();
  const { selectedMerchant } = useMerchantStore();
  const convertAmount = useConvertAmount();

  const key = selectedCountry
    ? ['orders', 'receive-list', params, selectedCountry.code, selectedMerchant?.appid]
    : null;

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
  const [searchParams] = useSearchParams();
  const { selectedCountry } = useCountryStore();
  const { selectedMerchant } = useMerchantStore();

  const startTime = searchParams.get('startTime') || undefined;
  const endTime = searchParams.get('endTime') || undefined;

  const key = selectedCountry
    ? ['orders', 'receive-stat', startTime, endTime, selectedCountry.code, selectedMerchant?.appid]
    : null;

  const { data, isLoading } = useSWR(key, () => getCollectionOrderStats({ startTime, endTime }), {
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
