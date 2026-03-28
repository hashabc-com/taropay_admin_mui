import type { MonthlySummaryParams } from 'src/api/business';

import useSWR from 'swr';
import { useMemo } from 'react';

import { useListSWRKey } from 'src/hooks/use-list-swr-key';
import { useConvertAmount } from 'src/hooks/use-convert-amount';
import { useSearchParamsObject } from 'src/hooks/use-list-search';

import { getBusinessMonthlySummary } from 'src/api/business';

// ----------------------------------------------------------------------

export type BusinessMonthlySummaryRecord = {
  businessName?: string;
  localTime?: string;
  inBills?: number;
  inAmount?: number | string;
  inAmountService?: number | string;
  inAmountProfit?: number | string;
  outBills?: number;
  outAmount?: number | string;
  outAmountService?: number | string;
  outAmountProfit?: number | string;
};

export const FIELD_KEYS = ['businessName', 'startMonth', 'endMonth'] as const;

export function useBusinessMonthlySummary() {
  const params = useSearchParamsObject(FIELD_KEYS) as unknown as MonthlySummaryParams;
  const convertAmount = useConvertAmount();
  const key = useListSWRKey('business', 'monthly-summary', params);

  const { data, isLoading, mutate } = useSWR(key, () => getBusinessMonthlySummary(params), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const records: BusinessMonthlySummaryRecord[] = useMemo(
    () =>
      (data?.result?.listRecord || []).map((item: BusinessMonthlySummaryRecord, i: number) => ({
        ...item,
        id: i,
        inAmount: convertAmount(item.inAmount || 0, false),
        inAmountService: convertAmount(item.inAmountService || 0, false),
        outAmount: convertAmount(item.outAmount || 0, false),
        outAmountService: convertAmount(item.outAmountService || 0, false),
      })),
    [data, convertAmount]
  );

  const totalRecord: number = data?.result?.totalRecord || 0;

  return { records, totalRecord, isLoading, mutate };
}
