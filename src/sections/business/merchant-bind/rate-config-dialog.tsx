import type { MerchantBindRecord } from './hooks';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { getChannelTypeList } from 'src/api/merchant';
import { useCountryStore } from 'src/stores/country-store';
import { useLanguage } from 'src/context/language-provider';
import { getBusinessRate, configureBusinessRate } from 'src/api/business';

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
  business: MerchantBindRecord | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function RateConfigDialog({ open, business, onClose, onSuccess }: Props) {
  const { t } = useLanguage();
  const { selectedCountry } = useCountryStore();
  const currency = selectedCountry?.currency || 'USD';

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [collectionRates, setCollectionRates] = useState<RateItem[]>([]);
  const [payoutRates, setPayoutRates] = useState<RateItem[]>([]);

  useEffect(() => {
    if (open && business) {
      loadRateData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, business]);

  const loadRateData = async () => {
    if (!business) return;
    setLoading(true);
    try {
      const channelRes = await getChannelTypeList(selectedCountry?.code || '');
      const channelData = (channelRes as any)?.result || channelRes;
      const payinChannel: string[] = channelData?.payinChannel || [];
      const payoutChannel: string[] = channelData?.payoutChannel || [];

      const collectionItems: RateItem[] = payinChannel.map((ch) => ({
        id: '',
        payCode: ch,
        label: ch,
        rate: '',
        feeAmount: '',
      }));
      const payoutItems: RateItem[] = payoutChannel.map((ch) => ({
        id: '',
        payCode: ch,
        label: ch,
        rate: '',
        feeAmount: '',
      }));

      const rateRes = await getBusinessRate(business.id);
      const rateData = (rateRes as any)?.result || rateRes;
      if (Array.isArray(rateData)) {
        rateData.forEach((item: any) => {
          const target = item.type == 1 ? payoutItems : collectionItems;
          const found = target.find((r) => r.payCode === item.payCode);
          if (found) {
            found.rate = item.rate || 0;
            found.feeAmount = item.feeAmount || 0;
            found.id = item.id || '';
          }
        });
      }

      setCollectionRates(collectionItems);
      setPayoutRates(payoutItems);
    } catch {
      toast.error(t('merchant.info.error.fetchRateDataFailed'));
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
    const setItems = type === 'collection' ? setCollectionRates : setPayoutRates;
    setItems((prev) => {
      const next = [...prev];
      const numValue = value === '' ? '' : Number(value);
      next[index] = { ...next[index], [field]: numValue !== '' && numValue < 0 ? 0 : numValue };
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!business) return;

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

    setSubmitting(true);
    try {
      const submitData: any[] = [];

      collectionRates.forEach((item) => {
        if (item.rate !== '' && item.feeAmount !== '') {
          submitData.push({
            id: item.id || '',
            businessId: business.id,
            payCode: item.payCode,
            rate: Number(item.rate),
            feeAmount: Number(item.feeAmount),
            type: '2',
            country: selectedCountry?.code || '',
            configType: 1,
          });
        }
      });

      payoutRates.forEach((item) => {
        if (item.rate !== '' && item.feeAmount !== '') {
          submitData.push({
            id: item.id || '',
            businessId: business.id,
            payCode: item.payCode,
            rate: Number(item.rate),
            feeAmount: Number(item.feeAmount),
            type: '1',
            country: selectedCountry?.code || '',
            configType: 1,
          });
        }
      });

      const res = await configureBusinessRate(submitData);
      if (res.code == 200) {
        toast.success(t('merchant.info.success.rateConfigUpdated'));
        onSuccess();
      } else {
        toast.error(res.message || t('merchant.info.error.rateConfigUpdateFailed'));
      }
    } catch {
      toast.error(t('merchant.info.error.rateConfigUpdateFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const renderRateSection = (title: string, items: RateItem[], type: 'collection' | 'payout') => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          {title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, minWidth: 340 }}>
          <Typography variant="body2" fontWeight="bold" sx={{ width: 150 }}>
            {t('merchant.info.rate')}
          </Typography>
          <Typography variant="body2" fontWeight="bold" sx={{ width: 150 }}>
            {t('merchant.info.singleFixedAmount')}({currency})
          </Typography>
        </Box>
      </Box>
      {items.map((item, index) => (
        <Box key={item.payCode} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
          <Typography variant="body2" sx={{ width: 160, flexShrink: 0 }}>
            {item.label}:
          </Typography>
          <TextField
            size="small"
            type="number"
            inputProps={{ step: 0.001, min: 0 }}
            placeholder={t('merchant.info.rate')}
            value={item.rate}
            onChange={(e) => updateRate(type, index, 'rate', e.target.value)}
            sx={{ width: 150 }}
          />
          <TextField
            size="small"
            type="number"
            inputProps={{ step: 0.01, min: 0 }}
            placeholder={t('merchant.info.singleFee')}
            value={item.feeAmount}
            onChange={(e) => updateRate(type, index, 'feeAmount', e.target.value)}
            sx={{ width: 150 }}
          />
        </Box>
      ))}
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('merchant.info.rateConfig')}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {t('business.merchantBind.businessUserName')}: <strong>{business?.account}</strong>
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {renderRateSection(t('merchant.info.collectionChannel'), collectionRates, 'collection')}
            <Divider />
            {renderRateSection(t('merchant.info.payoutChannel'), payoutRates, 'payout')}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting || loading}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || loading}
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {submitting ? t('common.submitting') : t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
