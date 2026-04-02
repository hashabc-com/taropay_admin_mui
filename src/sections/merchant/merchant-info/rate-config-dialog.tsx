import type { MerchantInfo } from 'src/api/merchant';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';

import { useCountryStore } from 'src/stores/country-store';
import { useLanguage } from 'src/context/language-provider';
import { getMerchantRate, getChannelTypeList, updateMerchantRate } from 'src/api/merchant';

// ----------------------------------------------------------------------

type RateItem = {
  id: string;
  payCode: string;
  label: string;
  rate: string | number;
  feeAmount: string | number;
};

type RateConfigDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchant: MerchantInfo | null;
  onSuccess: () => void;
};

export function RateConfigDialog({
  open,
  onOpenChange,
  merchant,
  onSuccess,
}: RateConfigDialogProps) {
  const { t } = useLanguage();
  const selectedCountry = useCountryStore((s) => s.selectedCountry);
  const currency = selectedCountry?.currency || 'USD';

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [collectionRates, setCollectionRates] = useState<RateItem[]>([]);
  const [payoutRates, setPayoutRates] = useState<RateItem[]>([]);

  useEffect(() => {
    if (open && merchant) {
      loadRateData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, merchant]);

  const loadRateData = async () => {
    if (!merchant) return;

    setDataLoading(true);
    try {
      const channelRes = await getChannelTypeList(merchant.country);
      const channelData = (channelRes as any)?.result || channelRes;
      const payinChannel: string[] = channelData?.payinChannel || [];
      const payoutChannel: string[] = channelData?.payoutChannel || [];

      const collectionItems: RateItem[] = payinChannel.map((channel) => ({
        id: '',
        payCode: channel,
        label: channel,
        rate: '',
        feeAmount: '',
      }));

      const payoutItems: RateItem[] = payoutChannel.map((channel) => ({
        id: '',
        payCode: channel,
        label: channel,
        rate: '',
        feeAmount: '',
      }));

      const rateRes = await getMerchantRate({ merchantId: merchant.appid });
      const rateData = (rateRes as any)?.result || rateRes;

      if (Array.isArray(rateData)) {
        rateData.forEach((rateItem: any) => {
          const { payCode, rate, feeAmount, type, id } = rateItem;

          if (type == 1) {
            const item = payoutItems.find((i) => i.payCode === payCode);
            if (item) {
              item.rate = rate || 0;
              item.feeAmount = feeAmount || 0;
              item.id = id || '';
            }
          } else if (type == 2) {
            const item = collectionItems.find((i) => i.payCode === payCode);
            if (item) {
              item.rate = rate || 0;
              item.feeAmount = feeAmount || 0;
              item.id = id || '';
            }
          }
        });
      }

      setCollectionRates(collectionItems);
      setPayoutRates(payoutItems);
    } catch (error) {
      console.error('Failed to load rate data:', error);
      toast.warning(t('merchant.info.error.fetchRateDataFailed'));
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!merchant) return;

    const allItems = [...collectionRates, ...payoutRates];
    const hasInvalidData = allItems.some((item) => {
      const hasRate = item.rate !== '' && String(item.rate).trim() !== '';
      const hasFeeAmount = item.feeAmount !== '' && String(item.feeAmount).trim() !== '';
      return (hasRate && !hasFeeAmount) || (!hasRate && hasFeeAmount);
    });

    if (hasInvalidData) {
      toast.warning(t('merchant.info.validation.rateFeeRequired'));
      return;
    }

    setLoading(true);
    try {
      const submitData: Record<string, unknown>[] = [];

      collectionRates.forEach((item) => {
        const hasRate = item.rate !== '' && String(item.rate).trim() !== '';
        const hasFeeAmount = item.feeAmount !== '' && String(item.feeAmount).trim() !== '';

        if (hasRate && hasFeeAmount) {
          submitData.push({
            id: item.id || '',
            appid: merchant.appid,
            payCode: item.payCode,
            rate: Number(item.rate),
            feeAmount: Number(item.feeAmount),
            type: '2',
            country: merchant.country,
          });
        }
      });

      payoutRates.forEach((item) => {
        const hasRate = item.rate !== '' && String(item.rate).trim() !== '';
        const hasFeeAmount = item.feeAmount !== '' && String(item.feeAmount).trim() !== '';

        if (hasRate && hasFeeAmount) {
          submitData.push({
            id: item.id || '',
            appid: merchant.appid,
            payCode: item.payCode,
            rate: Number(item.rate),
            feeAmount: Number(item.feeAmount),
            type: '1',
            country: merchant.country,
          });
        }
      });

      const res = await updateMerchantRate(submitData);
      if (res) {
        toast.success(t('merchant.info.success.rateConfigUpdated'));
        onOpenChange(false);
        onSuccess();
      }
    } catch {
      toast.error(t('merchant.info.error.rateConfigUpdateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const updateRate = (
    type: 'collection' | 'payout',
    index: number,
    field: 'rate' | 'feeAmount',
    value: string
  ) => {
    const items = type === 'collection' ? collectionRates : payoutRates;
    const setItems = type === 'collection' ? setCollectionRates : setPayoutRates;

    const newItems = [...items];
    const numValue = value === '' ? '' : Number(value);
    newItems[index] = {
      ...newItems[index],
      [field]: numValue !== '' && numValue < 0 ? 0 : numValue,
    };
    setItems(newItems);
  };

  return (
    <Dialog
      open={open}
      onClose={() => !loading && !dataLoading && onOpenChange(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{t('merchant.info.rateConfig')}</DialogTitle>

      <DialogContent dividers sx={{ maxHeight: '60vh' }}>
        <DialogContentText sx={{ mb: 2 }}>
          {t('common.merchant')}：<strong>{merchant?.companyName}</strong>
        </DialogContentText>

        {dataLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* 代收渠道配置 */}
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                // justifyContent="space-between"
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle1">{t('merchant.info.collectionChannel')}</Typography>
                <Stack direction="row" spacing={2} sx={{ ml: 2 }}>
                  <Typography variant="caption" sx={{ width: 120, textAlign: 'center', mr: 8 }}>
                    {t('merchant.info.rate')}
                  </Typography>
                  <Typography variant="caption" sx={{ width: 120, textAlign: 'center' }}>
                    {t('merchant.info.singleFixedAmount')}({currency})
                  </Typography>
                </Stack>
              </Stack>

              <Divider sx={{ mb: 1.5 }} />

              <Stack spacing={1.5}>
                {collectionRates.map((item, index) => (
                  <Stack key={item.payCode} direction="row" alignItems="center" spacing={2}>
                    <Typography
                      variant="body2"
                      sx={{ width: 140, flexShrink: 0, color: 'text.secondary' }}
                    >
                      {item.label}
                    </Typography>
                    <TextField
                      size="small"
                      type="number"
                      placeholder={t('merchant.info.rate')}
                      value={item.rate}
                      onChange={(e) => updateRate('collection', index, 'rate', e.target.value)}
                      slotProps={{ htmlInput: { step: 0.001, min: 0 } }}
                      sx={{ width: 150 }}
                    />
                    <TextField
                      size="small"
                      type="number"
                      placeholder={t('merchant.info.singleFee')}
                      value={item.feeAmount}
                      onChange={(e) => updateRate('collection', index, 'feeAmount', e.target.value)}
                      slotProps={{ htmlInput: { step: 0.01, min: 0 } }}
                      sx={{ width: 150 }}
                    />
                  </Stack>
                ))}
              </Stack>
            </Box>

            {/* 代付渠道配置 */}
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                // justifyContent="space-between"
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle1">{t('merchant.info.payoutChannel')}</Typography>
                <Stack direction="row" spacing={2} sx={{ ml: 2 }}>
                  <Typography variant="caption" sx={{ width: 120, textAlign: 'center', mr: 8 }}>
                    {t('merchant.info.rate')}
                  </Typography>
                  <Typography variant="caption" sx={{ width: 120, textAlign: 'center' }}>
                    {t('merchant.info.singleFixedAmount')}({currency})
                  </Typography>
                </Stack>
              </Stack>

              <Divider sx={{ mb: 1.5 }} />

              <Stack spacing={1.5}>
                {payoutRates.map((item, index) => (
                  <Stack key={item.payCode} direction="row" alignItems="center" spacing={2}>
                    <Typography
                      variant="body2"
                      sx={{ width: 140, flexShrink: 0, color: 'text.secondary' }}
                    >
                      {item.label}
                    </Typography>
                    <TextField
                      size="small"
                      type="number"
                      placeholder={t('merchant.info.rate')}
                      value={item.rate}
                      onChange={(e) => updateRate('payout', index, 'rate', e.target.value)}
                      slotProps={{ htmlInput: { step: 0.001, min: 0 } }}
                      sx={{ width: 150 }}
                    />
                    <TextField
                      size="small"
                      type="number"
                      placeholder={t('merchant.info.singleFee')}
                      value={item.feeAmount}
                      onChange={(e) => updateRate('payout', index, 'feeAmount', e.target.value)}
                      slotProps={{ htmlInput: { step: 0.01, min: 0 } }}
                      sx={{ width: 150 }}
                    />
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={() => onOpenChange(false)} disabled={loading || dataLoading}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || dataLoading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {loading ? t('common.submitting') : t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
