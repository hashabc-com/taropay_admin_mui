import useSWR from 'swr';

import { useListSWRKey } from 'src/hooks/use-list-swr-key';

import { getExchangeRate, getAccountAmount } from 'src/api/fund';

// ----------------------------------------------------------------------

export function useAccountAmount() {
  const key = useListSWRKey('fund', 'account-amount');

  const { data, isLoading, mutate } = useSWR(key, () => getAccountAmount(), {
    revalidateOnFocus: false,
  });

  return { data: data?.result || {}, isLoading, mutate };
}

export function useExchangeRate() {
  const key = useListSWRKey('fund', 'exchange-rate');

  const { data, isLoading, mutate } = useSWR(key, () => getExchangeRate(), {
    revalidateOnFocus: false,
  });

  return { data: data?.result || {}, isLoading, mutate };
}
