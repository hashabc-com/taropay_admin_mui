import type { PaymentSummaryParams } from 'src/api/order';

import useSWR from 'swr';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { useConvertAmount } from 'src/hooks/use-convert-amount';

import { getPaymentSummary } from 'src/api/order';
import { useCountryStore } from 'src/stores/country-store';
import { useMerchantStore } from 'src/stores/merchant-store';

// ----------------------------------------------------------------------

export type PaymentSummaryRow = {
  id?: number;
  companyName?: string;
  paymentCompany?: string;
  dealTime?: string;
  billCount?: number;
  amount: number | string;
  serviceAmount: number | string;
  totalAmount: number | string;
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
  const convertAmount = useConvertAmount();
  const key = selectedCountry
    ? ['orders', 'payment-summary', params, selectedMerchant?.appid]
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
        amount: convertAmount(r.amount, false),
        serviceAmount: convertAmount(r.serviceAmount, false),
        totalAmount: convertAmount(r.totalAmount, false),
      })),
    [data, convertAmount]
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
