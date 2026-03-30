import type { RouteStrategyListParams } from 'src/api/config';

import useSWR from 'swr';

import { useListSWRKey } from 'src/hooks/use-list-swr-key';
import { useSearchParamsObject } from 'src/hooks/use-list-search';

import { getRouteStrategyList } from 'src/api/config';

// ----------------------------------------------------------------------

export const FIELD_KEYS = [] as const;

// ----------------------------------------------------------------------

export function useRouteStrategyList() {
  const params = useSearchParamsObject(FIELD_KEYS) as unknown as RouteStrategyListParams;

  const key = useListSWRKey('config', 'route-strategy', params);

  const { data, isLoading, mutate } = useSWR(key, () => getRouteStrategyList(params), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const records = data?.result?.listRecord || [];
  const totalRecord = data?.result?.totalRecord || 0;

  return { records, totalRecord, isLoading, mutate, params };
}
