import useSWR from 'swr';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import FormLabel from '@mui/material/FormLabel';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { getMerchantList } from 'src/api/common';
import { type Merchant } from 'src/stores/merchant-store';
import { useCountryStore } from 'src/stores/country-store';
import { useLanguage } from 'src/context/language-provider';
import { getPaymentMethods, getPaymentChannelsByMethod } from 'src/api/config';

import { type RouteStrategy, type PaymentChannelOption } from './types';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  strategy: RouteStrategy | null;
  isEdit: boolean;
};

type ChannelSelection = {
  paymentPlatform: string;
  weight?: number;
  id?: number;
};

export function RouteStrategyDialog({ open, onClose, onSubmit, strategy, isEdit }: Props) {
  const { t } = useLanguage();
  const { selectedCountry } = useCountryStore();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    appid: '',
    paymentType: '2',
    productCode: '',
    routeStrategy: '1',
  });
  const [channels, setChannels] = useState<ChannelSelection[]>([]);

  // Fetch merchants
  const { data: merchantData } = useSWR(
    open && selectedCountry ? ['merchants-for-route', selectedCountry.code] : null,
    getMerchantList,
    { revalidateOnFocus: false }
  );
  const merchants: Merchant[] = (merchantData?.result || []) as Merchant[];

  // Fetch payment methods
  const { data: methodsData } = useSWR(
    open && selectedCountry && form.paymentType
      ? ['payment-methods', selectedCountry.code, form.paymentType]
      : null,
    () => getPaymentMethods({ country: selectedCountry!.code, type: form.paymentType }),
    { revalidateOnFocus: false }
  );
  const paymentMethods: string[] = (methodsData?.result || []) as string[];

  // Fetch channels by method
  const { data: channelsData } = useSWR(
    open && selectedCountry && form.paymentType && form.productCode
      ? [
          'channels-by-method',
          selectedCountry.code,
          form.paymentType,
          form.productCode,
          isEdit ? strategy?.id : null,
        ]
      : null,
    () =>
      getPaymentChannelsByMethod({
        country: selectedCountry!.code,
        type: form.paymentType,
        subchannelcode: form.productCode,
        ...(isEdit && strategy?.id ? { id: strategy.id } : {}),
      }),
    { revalidateOnFocus: false }
  );

  const availableChannels: Array<{
    id: number;
    channelCode: string;
    weightId?: number | null;
    weight?: number;
  }> = ((channelsData?.result || []) as PaymentChannelOption[]).map((item) => ({
    id: item.id,
    channelCode: item.channelCode,
    weightId: item.weightId,
    weight: item.weight,
  }));

  // Init form
  useEffect(() => {
    if (!open) return;
    if (isEdit && strategy) {
      setForm({
        appid: strategy.appid || '',
        paymentType: strategy.paymentType,
        productCode: strategy.productCode,
        routeStrategy: strategy.routeStrategy,
      });
      setChannels([]);
    } else {
      setForm({ appid: '', paymentType: '2', productCode: '', routeStrategy: '1' });
      setChannels([]);
    }
  }, [open, isEdit, strategy]);

  // Clear channels when type or method changes
  useEffect(() => {
    setChannels([]);
  }, [form.paymentType, form.productCode]);

  // Auto-select previously selected channels (edit mode)
  useEffect(() => {
    if (channelsData?.result && open) {
      const selected = (channelsData.result as PaymentChannelOption[])
        .filter((item) => item.weightId != null)
        .map((item) => ({
          paymentPlatform: item.channelCode,
          weight: form.routeStrategy === '1' ? item.weight || 0 : undefined,
          id: item.weightId as number,
        }));
      setChannels(selected);
    }
  }, [channelsData, open, form.routeStrategy]);

  const handleChannelToggle = useCallback(
    (channelCode: string, checked: boolean, weightId?: number | null) => {
      if (checked) {
        const newChannel: ChannelSelection = {
          paymentPlatform: channelCode,
          weight: form.routeStrategy === '1' ? 0 : undefined,
        };
        if (weightId != null) newChannel.id = weightId;
        setChannels((prev) => [...prev, newChannel]);
      } else {
        setChannels((prev) => prev.filter((ch) => ch.paymentPlatform !== channelCode));
      }
    },
    [form.routeStrategy]
  );

  const handleWeightChange = useCallback((channelCode: string, weight: string) => {
    setChannels((prev) =>
      prev.map((ch) =>
        ch.paymentPlatform === channelCode ? { ...ch, weight: Number(weight) || 0 } : ch
      )
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!form.productCode || channels.length === 0) return;
    setLoading(true);
    try {
      await onSubmit({
        id: strategy?.id,
        appid: form.appid || undefined,
        paymentType: form.paymentType,
        productCode: form.productCode,
        routeStrategy: form.routeStrategy,
        country: selectedCountry!.code,
        paymentRouteChannelWeightList: channels,
      });
    } finally {
      setLoading(false);
    }
  }, [form, channels, strategy, selectedCountry, onSubmit]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit
          ? t('config.routeStrategy.editRouteConfig')
          : t('config.routeStrategy.addRouteConfig')}
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Merchant */}
        <FormControl size="small" fullWidth>
          <InputLabel>{t('config.routeStrategy.merchantName')}</InputLabel>
          <Select
            label={t('config.routeStrategy.merchantName')}
            value={form.appid}
            onChange={(e) => setForm((p) => ({ ...p, appid: e.target.value }))}
            disabled={isEdit}
          >
            {merchants.map((m) => (
              <MenuItem key={m.appid} value={m.appid}>
                {m.companyName}
              </MenuItem>
            ))}
          </Select>
          <Typography variant="caption" color="warning.main" sx={{ mt: 0.5 }}>
            {t('config.routeStrategy.merchantOptionalTip')}
          </Typography>
        </FormControl>

        {/* Payment type */}
        <FormControl>
          <FormLabel>{t('config.routeStrategy.type')}</FormLabel>
          <RadioGroup
            row
            value={form.paymentType}
            onChange={(e) => {
              setForm((p) => ({ ...p, paymentType: e.target.value, productCode: '' }));
            }}
          >
            <FormControlLabel
              value="1"
              control={<Radio size="small" />}
              label={t('config.routeStrategy.payout')}
            />
            <FormControlLabel
              value="2"
              control={<Radio size="small" />}
              label={t('config.routeStrategy.collection')}
            />
          </RadioGroup>
        </FormControl>

        {/* Payment method */}
        <FormControl>
          <FormLabel>{t('config.routeStrategy.paymentMethod')}</FormLabel>
          <RadioGroup
            row
            value={form.productCode}
            onChange={(e) => setForm((p) => ({ ...p, productCode: e.target.value }))}
            sx={{ flexWrap: 'wrap', gap: 1 }}
          >
            {paymentMethods.map((method) => (
              <FormControlLabel
                key={method}
                value={method}
                control={<Radio size="small" />}
                label={method}
              />
            ))}
          </RadioGroup>
        </FormControl>

        {/* Route strategy */}
        <FormControl>
          <FormLabel>{t('config.routeStrategy.routeStrategy')}</FormLabel>
          <RadioGroup
            row
            value={form.routeStrategy}
            onChange={(e) => setForm((p) => ({ ...p, routeStrategy: e.target.value }))}
          >
            <FormControlLabel
              value="1"
              control={<Radio size="small" />}
              label={t('config.routeStrategy.weightRoundRobin')}
            />
            <FormControlLabel
              value="2"
              control={<Radio size="small" />}
              label={t('config.routeStrategy.costPriority')}
            />
          </RadioGroup>
        </FormControl>

        {/* Channels */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t('config.routeStrategy.paymentChannels')}
          </Typography>
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            {availableChannels.length > 0 ? (
              availableChannels.map((ch) => {
                const isChecked = channels.some((s) => s.paymentPlatform === ch.channelCode);
                const weight =
                  channels.find((s) => s.paymentPlatform === ch.channelCode)?.weight || 0;

                return (
                  <Box key={ch.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Checkbox
                      size="small"
                      checked={isChecked}
                      onChange={(e) =>
                        handleChannelToggle(ch.channelCode, e.target.checked, ch.weightId)
                      }
                    />
                    <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
                      {ch.channelCode}
                    </Typography>
                    {form.routeStrategy === '1' && isChecked && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {t('config.routeStrategy.weight')}:
                        </Typography>
                        <TextField
                          size="small"
                          type="number"
                          value={weight}
                          onChange={(e) => handleWeightChange(ch.channelCode, e.target.value)}
                          sx={{ width: 80 }}
                          slotProps={{ htmlInput: { min: 0, max: 100 } }}
                        />
                      </Box>
                    )}
                  </Box>
                );
              })
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                {form.productCode
                  ? t('common.noData')
                  : t('config.routeStrategy.selectPaymentMethodFirst')}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !form.productCode || channels.length === 0}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {loading ? t('common.submitting') : t('common.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
