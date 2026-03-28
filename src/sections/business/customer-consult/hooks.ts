import type { CustomerConsultParams } from 'src/api/business';

import useSWR from 'swr';
import { useMemo } from 'react';

import { useListSWRKey } from 'src/hooks/use-list-swr-key';
import { useSearchParamsObject } from 'src/hooks/use-list-search';

import { getCustomerConsultList } from 'src/api/business';

// ----------------------------------------------------------------------

export type CustomerStatus = 'NEW' | 'FOLLOWING' | 'DEAL' | 'LOST';
export type CustomerLevel = 'A' | 'B' | 'C';
export type FollowType = 'PHONE' | 'VISIT' | 'EMAIL' | 'WECHAT' | 'OTHER';
export type FollowResult = 'INTERESTED' | 'CONSIDERING' | 'REFUSED' | 'SUCCESS';

export type CustomerConsultRecord = {
  id: number;
  customerName: string | null;
  contactPerson: string | null;
  countryCode: string;
  phone: string | null;
  email: string | null;
  company: string | null;
  industry: string | null;
  source: string | null;
  country: string;
  status: CustomerStatus;
  level: CustomerLevel | null;
  consultContent: string | null;
  remark: string | null;
  createdAt: string;
  updatedAt: string | null;
  isDeleted: string;
};

export type FollowRecord = {
  id: number;
  customerId: number;
  followType: FollowType;
  followContent: string;
  followResult: FollowResult;
  followBy: string | null;
  followAt: string;
  remark: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export const FIELD_KEYS = ['contactPerson', 'phone', 'email', 'company'] as const;

export function useCustomerConsultList() {
  const params = useSearchParamsObject(FIELD_KEYS) as unknown as CustomerConsultParams;
  const key = useListSWRKey('business', 'customer-consult', params);

  const { data, isLoading, mutate } = useSWR(key, () => getCustomerConsultList(params), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const records: CustomerConsultRecord[] = useMemo(() => data?.result?.listRecord || [], [data]);

  const totalRecord: number = data?.result?.totalRecord || records.length;

  return { records, totalRecord, isLoading, mutate };
}
