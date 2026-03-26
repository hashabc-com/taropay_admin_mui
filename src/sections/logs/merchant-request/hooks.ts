import type { MerchantRequestParams } from 'src/api/logs';

import useSWR from 'swr';

import { useListSWRKey } from 'src/hooks/use-list-swr-key';
import { useSearchParamsObject } from 'src/hooks/use-list-search';

import { getMerchantRequestList } from 'src/api/logs';

// ----------------------------------------------------------------------

/** Shared field keys — used by both search (UI) and SWR hooks (data) */
export const FIELD_KEYS = ['transactionId', 'transactionType', 'status'] as const;

// ----------------------------------------------------------------------

export function useMerchantRequestList() {
  const params = useSearchParamsObject(FIELD_KEYS) as unknown as MerchantRequestParams;

  const key = useListSWRKey('logs', 'merchant-request', params);

  const { data, isLoading, mutate } = useSWR(key, () => getMerchantRequestList(params), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const records = data?.result?.listRecord || [];
  const totalRecord = data?.result?.totalRecord || 0;

  return { records, totalRecord, isLoading, mutate, params };
}
