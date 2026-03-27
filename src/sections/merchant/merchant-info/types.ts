export type { MerchantInfo } from 'src/api/merchant';

// ----------------------------------------------------------------------

export const MERCHANT_STATUS_MAP: Record<number, { label: string; color: 'success' | 'error' }> = {
  0: { label: '启用', color: 'success' },
  1: { label: '禁用', color: 'error' },
};
