import type { MerchantRequest } from './types';
import type { MerchantRequestParams } from 'src/api/logs';

import useSWR from 'swr';
import { useMemo } from 'react';

import { useListSWRKey } from 'src/hooks/use-list-swr-key';
import { useConvertAmount } from 'src/hooks/use-convert-amount';
import { useSearchParamsObject } from 'src/hooks/use-list-search';

import { getMerchantRequestList } from 'src/api/logs';

// ----------------------------------------------------------------------

/** Shared field keys — used by both search (UI) and SWR hooks (data) */
export const FIELD_KEYS = ['transactionId', 'transactionType', 'status'] as const;

// ----------------------------------------------------------------------

export function useMerchantRequestList() {
  const params = useSearchParamsObject(FIELD_KEYS) as unknown as MerchantRequestParams;
  const convertAmount = useConvertAmount();
  const key = useListSWRKey('logs', 'merchant-request', params);

  const { data, isLoading, mutate } = useSWR(key, () => getMerchantRequestList(params), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  // const records = data?.result?.listRecord || [];
  const records = useMemo(
    () =>
      (data?.result?.listRecord || []).map((item: MerchantRequest) => ({
        ...item,
        serviceAmount: convertAmount(item.serviceAmount, false),
        amount: convertAmount(item.amount, false),
      })),
    [data, convertAmount]
  );
  const totalRecord = data?.result?.totalRecord || 0;

  return { records, totalRecord, isLoading, mutate, params };
}
