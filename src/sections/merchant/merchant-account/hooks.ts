import type { MerchantUser, MerchantUserListParams } from 'src/api/merchant-user';

import useSWR from 'swr';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { useSearchParamsObject } from 'src/hooks/use-list-search';

import { getMerchantUserList } from 'src/api/merchant-user';

// ----------------------------------------------------------------------

export const FIELD_KEYS = ['account', 'status'] as const;

export const STATUS_MAP: Record<string, { label: string; color: 'success' | 'error' | 'default' }> =
  {
    '0': { label: '启用', color: 'success' },
    '1': { label: '禁用', color: 'error' },
  };

// ----------------------------------------------------------------------

export function useMerchantUserList() {
  const params = useSearchParamsObject(FIELD_KEYS) as unknown as MerchantUserListParams;
  const [searchParams] = useSearchParams();
  const refreshToken = searchParams.get('_t');

  const key = ['merchant-user', 'list', params, refreshToken];

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    () => getMerchantUserList(params),
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  const list: MerchantUser[] = useMemo(
    () => data?.result?.listRecord || data?.data?.listRecord || [],
    [data]
  );

  const totalRecord: number = data?.result?.totalRecord || data?.data?.totalRecord || 0;

  return { list, totalRecord, error, isLoading, isValidating, mutate, params };
}
