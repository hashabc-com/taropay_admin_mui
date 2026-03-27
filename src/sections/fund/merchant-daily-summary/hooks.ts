import type { DailySummaryParams } from 'src/api/fund';

import useSWR from 'swr';
import { useMemo } from 'react';

import { useListSWRKey } from 'src/hooks/use-list-swr-key';
import { useConvertAmount } from 'src/hooks/use-convert-amount';
import { useSearchParamsObject } from 'src/hooks/use-list-search';

import { getMerchantDailySummary } from 'src/api/fund';

// ----------------------------------------------------------------------

export type MerchantDailySummaryRecord = {
  companyName?: string;
  localTime?: string;
  inBills?: number;
  inAmount?: number | string;
  inAmountService?: number | string;
  inAmountProfit?: number | string;
  outBills?: number;
  outAmount?: number | string;
  outAmountService?: number | string;
  outAmountProfit?: number | string;
  rechargeAmoubt?: number | string;
  withdrawAmount?: number | string;
  settlementAmount?: number | string;
  availableAmount?: number | string;
};

export const FIELD_KEYS = ['startTime', 'endTime'] as const;

export function useMerchantDailySummary() {
  const params = useSearchParamsObject(FIELD_KEYS) as unknown as DailySummaryParams;
  const convertAmount = useConvertAmount();
  const key = useListSWRKey('fund', 'merchant-daily-summary', params);

  const { data, isLoading, mutate } = useSWR(key, () => getMerchantDailySummary(params), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const records: MerchantDailySummaryRecord[] = useMemo(
    () =>
      (data?.result?.listRecord || []).map((item: MerchantDailySummaryRecord, i: number) => ({
        ...item,
        id: i,
        inAmount: convertAmount(item.inAmount || 0, false),
        inAmountService: convertAmount(item.inAmountService || 0, false),
        outAmount: convertAmount(item.outAmount || 0, false),
        outAmountService: convertAmount(item.outAmountService || 0, false),
        rechargeAmoubt: convertAmount(item.rechargeAmoubt || 0, false),
        withdrawAmount: convertAmount(item.withdrawAmount || 0, false),
        settlementAmount: convertAmount(item.settlementAmount || 0, false),
        availableAmount: convertAmount(item.availableAmount || 0, false),
      })),
    [data, convertAmount]
  );

  const totalRecord: number = data?.result?.totalRecord || 0;

  return { records, totalRecord, isLoading, mutate };
}
