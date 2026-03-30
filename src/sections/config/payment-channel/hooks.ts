import type { PaymentChannelListParams } from 'src/api/config';

import useSWR from 'swr';

import { useListSWRKey } from 'src/hooks/use-list-swr-key';
import { useSearchParamsObject } from 'src/hooks/use-list-search';

import { getPaymentChannelList } from 'src/api/config';

// ----------------------------------------------------------------------

/** Shared field keys — used by both search (UI) and SWR hooks (data) */
export const FIELD_KEYS = ['country', 'channelCode'] as const;

// ----------------------------------------------------------------------

export function usePaymentChannelList() {
  const params = useSearchParamsObject(FIELD_KEYS) as unknown as PaymentChannelListParams;

  const key = useListSWRKey('config', 'payment-channel', params);

  const { data, isLoading, mutate } = useSWR(key, () => getPaymentChannelList(params), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const records = data?.result?.listRecord || [];
  const totalRecord = data?.result?.totalRecord || 0;

  return { records, totalRecord, isLoading, mutate, params };
}
