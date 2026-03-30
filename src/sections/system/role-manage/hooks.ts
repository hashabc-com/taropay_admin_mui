import useSWR from 'swr';

import { useListSWRKey } from 'src/hooks/use-list-swr-key';
import { useSearchParamsObject } from 'src/hooks/use-list-search';

import { getRoleList } from 'src/api/system';

// ----------------------------------------------------------------------

export const FIELD_KEYS = ['createTimeBegin', 'createTimeEnd'] as const;

// ----------------------------------------------------------------------

export function useRoleList() {
  const params = useSearchParamsObject(FIELD_KEYS) as Record<string, unknown>;

  const key = useListSWRKey('system', 'role-manage', params);

  const { data, isLoading, mutate } = useSWR(key, () => getRoleList(params as any), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const records = data?.result?.listRecord || [];
  const totalRecord = data?.result?.totalRecord || 0;

  return { records, totalRecord, isLoading, mutate, params };
}
