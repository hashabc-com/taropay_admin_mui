import type { ReceiveSummaryParams } from 'src/api/order';

import useSWR from 'swr';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { useConvertAmount } from 'src/hooks/use-convert-amount';

import { useCountryStore } from 'src/stores/country-store';
import { useMerchantStore } from 'src/stores/merchant-store';
import { getReceiveSummary, getPaymentChannels } from 'src/api/order';

// ----------------------------------------------------------------------

export type ReceiveSummaryRow = {
  id?: number;
  companyName?: string;
  paymentCompany?: string;
  dealTime?: string;
  billCount?: number;
  amount: number | string;
  serviceAmount: number | string;
  totalAmount: number | string;
};

export type ReceiveSummaryTotals = {
  orderTotal?: string | number;
  amountTotal?: string | number;
  amountServiceTotal?: string | number;
  totalAmountTotal?: string | number;
};

// ----------------------------------------------------------------------

function useReceiveSummaryParams(): ReceiveSummaryParams {
  const [searchParams] = useSearchParams();

  return useMemo(
    () => ({
      pageNum: Number(searchParams.get('pageNum')) || 1,
      pageSize: Number(searchParams.get('pageSize')) || 10,
      channel: searchParams.get('channel') || undefined,
      startTime: searchParams.get('startTime') || undefined,
      endTime: searchParams.get('endTime') || undefined,
    }),
    [searchParams]
  );
}

export function useReceiveSummaryList() {
  const params = useReceiveSummaryParams();
  const { selectedCountry } = useCountryStore();
  const { selectedMerchant } = useMerchantStore();
  const convertAmount = useConvertAmount();

  const key = selectedCountry
    ? ['orders', 'receive-summary', params, selectedCountry.code, selectedMerchant?.appid]
    : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    () => getReceiveSummary(params),
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  const rows: ReceiveSummaryRow[] = useMemo(
    () =>
      (data?.result?.listRecord || []).map((r: ReceiveSummaryRow, i: number) => ({
        ...r,
        id: r.id ?? i,
        amount: convertAmount(r.amount, false),
        serviceAmount: convertAmount(r.serviceAmount, false),
        totalAmount: convertAmount(r.totalAmount, false),
      })),
    [data, convertAmount]
  );
  const totalRecord: number = data?.result?.totalRecord || 0;
  const totals: ReceiveSummaryTotals = useMemo(
    () => ({
      orderTotal: data?.result?.orderTotal,
      amountTotal: data?.result?.amountTotal,
      amountServiceTotal: data?.result?.amountServiceTotal,
      totalAmountTotal: data?.result?.totalAmountTotal,
    }),
    [data]
  );

  return { rows, totalRecord, totals, error, isLoading, isValidating, mutate, params };
}

// -- Payment channels dict --

export function usePaymentChannelDict(type: string) {
  const { selectedCountry } = useCountryStore();

  const key = selectedCountry ? ['dict', 'channels', type, selectedCountry.code] : null;

  const { data } = useSWR(key, () => getPaymentChannels(type), {
    revalidateOnFocus: false,
  });

  const channels: string[] = useMemo(() => {
    const r = data?.result;
    if (!Array.isArray(r)) return [];
    return r.map((item: any) => (typeof item === 'string' ? item : item.itemName));
  }, [data]);

  return channels;
}
