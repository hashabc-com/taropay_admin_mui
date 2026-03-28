import type { BusinessBindParams } from 'src/api/business';

import useSWR from 'swr';
import { useMemo } from 'react';

import { useListSWRKey } from 'src/hooks/use-list-swr-key';
import { useSearchParamsObject } from 'src/hooks/use-list-search';

import { getBusinessBindList } from 'src/api/business';

// ----------------------------------------------------------------------

export type MerchantBindRecord = {
  id: number;
  account: string;
  userName: string;
  disabledStatus: number;
  phone?: string | null;
  createTime: string;
};

export const FIELD_KEYS = ['userName'] as const;

export function useMerchantBindList() {
  const params = useSearchParamsObject(FIELD_KEYS) as unknown as BusinessBindParams;
  const key = useListSWRKey('business', 'merchant-bind', params);

  const { data, isLoading, mutate } = useSWR(key, () => getBusinessBindList(params), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const records: MerchantBindRecord[] = useMemo(
    () => (data?.result?.listRecord || []).map((item: MerchantBindRecord) => ({ ...item })),
    [data]
  );

  const totalRecord: number = data?.result?.totalRecord || 0;

  return { records, totalRecord, isLoading, mutate };
}
