import type { RiskControlParams } from 'src/api/logs';

import useSWR from 'swr';

import { useListSWRKey } from 'src/hooks/use-list-swr-key';
import { useSearchParamsObject } from 'src/hooks/use-list-search';

import { getRiskControlRecordList } from 'src/api/logs';

// ----------------------------------------------------------------------

/** Shared field keys — used by both search (UI) and SWR hooks (data) */
export const FIELD_KEYS = ['ruleName', 'businessType'] as const;

// ----------------------------------------------------------------------

export function useRiskControlList() {
  const params = useSearchParamsObject(FIELD_KEYS) as unknown as RiskControlParams;

  const key = useListSWRKey('logs', 'risk-control', params);

  const { data, isLoading, mutate } = useSWR(key, () => getRiskControlRecordList(params), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const records = data?.result?.listRecord || [];
  const totalRecord = data?.result?.totalRecord || 0;

  return { records, totalRecord, isLoading, mutate, params };
}
