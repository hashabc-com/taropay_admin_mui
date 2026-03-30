import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { getChannelTypeList } from 'src/api/merchant';
import { useCountryStore } from 'src/stores/country-store';
import { useLanguage } from 'src/context/language-provider';
import { getBusinessRate, configureBusinessRate } from 'src/api/business';

import { type PaymentChannel } from './types';

// ----------------------------------------------------------------------

type RateItem = {
  id: string;
  payCode: string;
  label: string;
  rate: string | number;
  feeAmount: string | number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  channel: PaymentChannel | null;
  onSuccess: () => void;
};

export function RateConfigDialog({ open, onClose, channel, onSuccess }: Props) {
  const { t } = useLanguage();
  const { selectedCountry } = useCountryStore();
  const currency = selectedCountry?.currency || 'USD';

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [collectionRates, setCollectionRates] = useState<RateItem[]>([]);
  const [payoutRates, setPayoutRates] = useState<RateItem[]>([]);

  useEffect(() => {
    if (open && channel) {
      loadRateData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, channel]);

  const loadRateData = async () => {
    if (!channel) return;
    setIsLoading(true);
    try {
      const channelRes = await getChannelTypeList(channel.country || '', channel.channelCode);
      const channelData = (channelRes as any)?.result || channelRes;
      const payinChannel = channelData?.payinChannel || [];
      const payoutChannel = channelData?.payoutChannel || [];

      const collectionItems: RateItem[] = payinChannel.map((c: string) => ({
        id: '',
        payCode: c,
        label: c,
        rate: '',
        feeAmount: '',
      }));

      const payoutItems: RateItem[] = payoutChannel.map((c: string) => ({
        id: '',
        payCode: c,
        label: c,
        rate: '',
        feeAmount: '',
      }));

      const rateRes = await getBusinessRate(channel.channelCode);
      const rateData = (rateRes as any)?.result || rateRes;

      if (Array.isArray(rateData)) {
        rateData.forEach((item: any) => {
          const { payCode, rate, feeAmount, type, id } = item;
          if (type == 1) {
            const found = payoutItems.find((i) => i.payCode === payCode);
            if (found) {
              found.rate = rate || 0;
              found.feeAmount = feeAmount || 0;
              found.id = id || '';
            }
          } else if (type == 2) {
            const found = collectionItems.find((i) => i.payCode === payCode);
            if (found) {
              found.rate = rate || 0;
              found.feeAmount = feeAmount || 0;
              found.id = id || '';
            }
          }
        });
      }

      setCollectionRates(collectionItems);
      setPayoutRates(payoutItems);
    } catch (error) {
      console.error('Failed to load rate data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateRate = useCallback(
    (type: 'collection' | 'payout', index: number, field: 'rate' | 'feeAmount', value: string) => {
      const items = type === 'collection' ? collectionRates : payoutRates;
      const setter = type === 'collection' ? setCollectionRates : setPayoutRates;
      const newItems = [...items];
      const numValue = value === '' ? '' : Number(value);
      newItems[index] = {
        ...newItems[index],
        [field]: numValue !== '' && numValue < 0 ? 0 : numValue,
      };
      setter(newItems);
    },
    [collectionRates, payoutRates]
  );

  const handleSubmit = useCallback(async () => {
    if (!channel) return;

    const allItems = [...collectionRates, ...payoutRates];
    const hasInvalid = allItems.some((item) => {
      const hasRate = item.rate !== '' && item.rate !== null && item.rate !== undefined;
      const hasFee =
        item.feeAmount !== '' && item.feeAmount !== null && item.feeAmount !== undefined;
      return (hasRate && !hasFee) || (!hasRate && hasFee);
    });

    if (hasInvalid) {
      toast.warning(t('merchant.info.validation.rateFeeRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData: any[] = [];

      collectionRates.forEach((item) => {
        if (item.rate !== '' && item.feeAmount !== '') {
          submitData.push({
            id: item.id || '',
            businessId: channel.channelCode,
            payCode: item.payCode,
            rate: Number(item.rate),
            feeAmount: Number(item.feeAmount),
            configType: 2,
            type: '2',
            country: channel.country || '',
          });
        }
      });

      payoutRates.forEach((item) => {
        if (item.rate !== '' && item.feeAmount !== '') {
          submitData.push({
            id: item.id || '',
            businessId: channel.channelCode,
            payCode: item.payCode,
            rate: Number(item.rate),
            feeAmount: Number(item.feeAmount),
            type: '1',
            configType: 2,
            country: channel.country || '',
          });
        }
      });

      const res = await configureBusinessRate(submitData as any);
      if (res.code == 200) {
        toast.success(t('fund.accountSettlement.rateUpdateSuccess'));
        onClose();
        onSuccess();
      } else {
        toast.error(res.message || t('fund.accountSettlement.rateUpdateFailed'));
      }
    } catch {
      toast.error(t('fund.accountSettlement.rateUpdateFailed'));
    } finally {
      setIsSubmitting(false);
    }
  }, [channel, collectionRates, payoutRates, t, onClose, onSuccess]);

  const renderRateSection = (title: string, items: RateItem[], type: 'collection' | 'payout') => (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          pb: 1,
          mb: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          {title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, ml: 10 }}>
          <Typography variant="caption" fontWeight="bold" sx={{ width: 140 }}>
            {t('merchant.info.rate')}
          </Typography>
          <Typography variant="caption" fontWeight="bold" sx={{ width: 140 }}>
            {t('merchant.info.singleFixedAmount')}({currency})
          </Typography>
        </Box>
      </Box>
      {items.map((item, index) => (
        <Box key={item.payCode} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Typography variant="body2" sx={{ width: 160, minWidth: 160, wordBreak: 'break-all' }}>
            {item.label}:
          </Typography>
          <TextField
            size="small"
            type="number"
            placeholder={t('merchant.info.rate')}
            value={item.rate}
            onChange={(e) => updateRate(type, index, 'rate', e.target.value)}
            sx={{ width: 140 }}
            slotProps={{ htmlInput: { step: '0.001', min: '0' } }}
          />
          <TextField
            size="small"
            type="number"
            placeholder={t('merchant.info.singleFee')}
            value={item.feeAmount}
            onChange={(e) => updateRate(type, index, 'feeAmount', e.target.value)}
            sx={{ width: 140 }}
            slotProps={{ htmlInput: { step: '0.01', min: '0' } }}
          />
        </Box>
      ))}
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('merchant.info.rateConfig')}</DialogTitle>
      <DialogContent dividers sx={{ pt: 3 }}>
        {channel && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('config.paymentChannel.channelCode')}: <strong>{channel.channelCode}</strong>
          </Typography>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {renderRateSection(t('merchant.info.collectionChannel'), collectionRates, 'collection')}
            {renderRateSection(t('merchant.info.payoutChannel'), payoutRates, 'payout')}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose} disabled={isSubmitting || isLoading}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting || isLoading}
          startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {isSubmitting ? t('common.submitting') : t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
