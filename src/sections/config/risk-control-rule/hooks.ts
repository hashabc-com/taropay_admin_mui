import type { RuleConfigListParams } from 'src/api/config';

import useSWR from 'swr';

import { useListSWRKey } from 'src/hooks/use-list-swr-key';
import { useSearchParamsObject } from 'src/hooks/use-list-search';

import { getRuleConfigList } from 'src/api/config';

// ----------------------------------------------------------------------

/** Shared field keys — used by both search (UI) and SWR hooks (data) */
export const FIELD_KEYS = ['ruleName', 'sceneCode', 'status'] as const;

// ----------------------------------------------------------------------

export function useRuleConfigList() {
  const params = useSearchParamsObject(FIELD_KEYS) as unknown as RuleConfigListParams;

  const key = useListSWRKey('config', 'risk-control-rule', params);

  const { data, isLoading, mutate } = useSWR(key, () => getRuleConfigList(params), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const records = data?.result?.listRecord || [];
  const totalRecord = data?.result?.totalRecord || 0;

  return { records, totalRecord, isLoading, mutate, params };
}
