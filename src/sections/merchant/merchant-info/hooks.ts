import type { MerchantInfo, MerchantInfoParams } from 'src/api/merchant';

import useSWR from 'swr';
import { useMemo } from 'react';

import { useListSWRKey } from 'src/hooks/use-list-swr-key';
import { useConvertAmount } from 'src/hooks/use-convert-amount';
import { useSearchParamsObject } from 'src/hooks/use-list-search';

import { getMerchantInfoList } from 'src/api/merchant';

// ----------------------------------------------------------------------

/** Shared field keys — used by both search (UI) and SWR hooks (data) */
export const FIELD_KEYS = ['startTime', 'endTime'] as const;

// ----------------------------------------------------------------------

export function useMerchantInfoList() {
  const params = useSearchParamsObject(FIELD_KEYS) as MerchantInfoParams;
  const convertAmount = useConvertAmount();

  const key = useListSWRKey('merchant', 'info-list', params);

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    () => getMerchantInfoList(params),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  const merchants: MerchantInfo[] = useMemo(
    () =>
      (data?.result?.listRecord || []).map((item: MerchantInfo) => ({
        ...item,
        amount: convertAmount(item.amount || 0, false),
        serviceAmount: convertAmount(item.serviceAmount || 0, false),
      })),
    [data, convertAmount]
  );

  const totalRecord: number = data?.result?.totalRecord || 0;

  return { merchants, totalRecord, error, isLoading, isValidating, mutate, params };
}
