import type { CollectionRateParams } from 'src/api/order';

import useSWR from 'swr';
import { useMemo } from 'react';

import { useSearchParamsObject } from 'src/hooks/use-list-search';

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

/** Shared field keys — used by both search (UI) and SWR hooks (data) */
export const FIELD_KEYS = ['channel', 'pickupCenter', 'startTime', 'endTime'] as const;

// ----------------------------------------------------------------------

export function useCollectionRateList() {
  const params = useSearchParamsObject(FIELD_KEYS) as unknown as CollectionRateParams;
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
