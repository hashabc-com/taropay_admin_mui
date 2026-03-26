import type { MessageRecordParams } from 'src/api/logs';

import useSWR from 'swr';
import { useMemo } from 'react';

import { useListSWRKey } from 'src/hooks/use-list-swr-key';
import { useSearchParamsObject } from 'src/hooks/use-list-search';

import { getMessageRecordList } from 'src/api/logs';

// ----------------------------------------------------------------------

/** Shared field keys — used by both search (UI) and SWR hooks (data) */
export const FIELD_KEYS = [
  'messageId',
  'correlationId',
  'queueName',
  'consumerService',
  'consumeStatus',
] as const;

// ----------------------------------------------------------------------

export function useMessageRecordList() {
  const params = useSearchParamsObject(FIELD_KEYS) as unknown as MessageRecordParams;

  const key = useListSWRKey('logs', 'message-record', params);

  const { data, isLoading, mutate } = useSWR(key, () => getMessageRecordList(params), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const records = useMemo(() => data?.result?.listRecord || [], [data]);
  const totalRecord: number = data?.result?.totalRecord || 0;

  return { records, totalRecord, isLoading, mutate, params };
}
