import type { CollectionRateParams } from 'src/api/order';

import useSWR from 'swr';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { getProductDict } from 'src/api/common';
import { useCountryStore } from 'src/stores/country-store';
import { useMerchantStore } from 'src/stores/merchant-store';
import { getPaymentChannels, getCollectionSuccessRate } from 'src/api/order';

// ----------------------------------------------------------------------

export type CollectionRateRow = {
  id?: number;
  companyName?: string;
  paymentCompany?: string;
  pickupCenter?: string;
  dealTime?: string;
  billCount?: number | string;
  successBillCount?: number | string;
  successRate?: string;
};

export type CollectionRateTotals = {
  allOrder?: number | string;
  successOrder?: number | string;
  successRate?: string;
};

// ----------------------------------------------------------------------

function useCollectionRateParams(): CollectionRateParams {
  const [searchParams] = useSearchParams();

  return useMemo(
    () => ({
      pageNum: Number(searchParams.get('pageNum')) || 1,
      pageSize: Number(searchParams.get('pageSize')) || 10,
      channel: searchParams.get('channel') || undefined,
      startTime: searchParams.get('startTime') || undefined,
      endTime: searchParams.get('endTime') || undefined,
      pickupCenter: searchParams.get('pickupCenter') || undefined,
    }),
    [searchParams]
  );
}

export function useCollectionRateList() {
  const params = useCollectionRateParams();
  const { selectedCountry } = useCountryStore();
  const { selectedMerchant } = useMerchantStore();

  const key = selectedCountry
    ? ['orders', 'collection-rate', params, selectedCountry.code, selectedMerchant?.appid]
    : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    () => getCollectionSuccessRate(params),
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  const rows: CollectionRateRow[] = useMemo(
    () =>
      (data?.result?.listRecord || []).map((r: CollectionRateRow, i: number) => ({
        ...r,
        id: r.id ?? i,
      })),
    [data]
  );
  const totalRecord: number = data?.result?.totalRecord || 0;
  const totals: CollectionRateTotals = useMemo(
    () => ({
      allOrder: data?.result?.allOrder,
      successOrder: data?.result?.successOrder,
      successRate: data?.result?.successRate,
    }),
    [data]
  );

  return { rows, totalRecord, totals, error, isLoading, isValidating, mutate, params };
}

// -- Dicts --

export function usePayChannelDict() {
  const { selectedCountry } = useCountryStore();

  const key = selectedCountry ? ['dict', 'channels', 'pay_channel', selectedCountry.code] : null;

  const { data } = useSWR(key, () => getPaymentChannels('pay_channel'), {
    revalidateOnFocus: false,
  });

  return useMemo(() => {
    const r = data?.result;
    if (!Array.isArray(r)) return [];
    return r.map((item: any) => (typeof item === 'string' ? item : item.itemName));
  }, [data]);
}

export function useProductDictList() {
  const { selectedCountry } = useCountryStore();

  const key = selectedCountry ? ['dict', 'product', selectedCountry.code] : null;

  const { data } = useSWR(key, () => getProductDict(), {
    revalidateOnFocus: false,
  });

  return useMemo(() => {
    const r = data?.result;
    if (r && r.payinChannel) return r.payinChannel as string[];
    if (Array.isArray(r)) return r as string[];
    return [];
  }, [data]);
}
