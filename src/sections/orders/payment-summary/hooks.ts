import type { PaymentSummaryParams } from 'src/api/order';

import useSWR from 'swr';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { useCountryStore } from 'src/stores/country-store';
import { useMerchantStore } from 'src/stores/merchant-store';
import { getPaymentSummary, getPaymentChannels } from 'src/api/order';

// ----------------------------------------------------------------------

export type PaymentSummaryRow = {
  id?: number;
  companyName?: string;
  paymentCompany?: string;
  dealTime?: string;
  billCount?: number;
  amount?: number | string;
  serviceAmount?: number | string;
  totalAmount?: number | string;
};

export type PaymentSummaryTotals = {
  orderTotal?: string | number;
  amountTotal?: string | number;
  amountServiceTotal?: string | number;
  totalAmountTotal?: string | number;
};

// ----------------------------------------------------------------------

function usePaymentSummaryParams(): PaymentSummaryParams {
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

export function usePaymentSummaryList() {
  const params = usePaymentSummaryParams();
  const { selectedCountry } = useCountryStore();
  const { selectedMerchant } = useMerchantStore();

  const key = selectedCountry
    ? ['orders', 'payment-summary', params, selectedCountry.code, selectedMerchant?.appid]
    : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    () => getPaymentSummary(params),
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  const rows: PaymentSummaryRow[] = useMemo(
    () =>
      (data?.result?.listRecord || []).map((r: PaymentSummaryRow, i: number) => ({
        ...r,
        id: r.id ?? i,
      })),
    [data]
  );
  const totalRecord: number = data?.result?.totalRecord || 0;
  const totals: PaymentSummaryTotals = useMemo(
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

// -- Payment channels dict for withdraw --

export function useWithdrawChannelDict() {
  const { selectedCountry } = useCountryStore();

  const key = selectedCountry
    ? ['dict', 'channels', 'withdraw_channel', selectedCountry.code]
    : null;

  const { data } = useSWR(key, () => getPaymentChannels('withdraw_channel'), {
    revalidateOnFocus: false,
  });

  const channels: string[] = useMemo(() => {
    const r = data?.result;
    if (!Array.isArray(r)) return [];
    return r.map((item: any) => (typeof item === 'string' ? item : item.itemName));
  }, [data]);

  return channels;
}
