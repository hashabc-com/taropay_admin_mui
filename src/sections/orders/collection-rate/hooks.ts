import type { CollectionRateParams } from 'src/api/order';

import useSWR from 'swr';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { getCollectionSuccessRate } from 'src/api/order';
import { useCountryStore } from 'src/stores/country-store';
import { useMerchantStore } from 'src/stores/merchant-store';

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
    ? ['orders', 'collection-rate', params, selectedMerchant?.appid]
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
