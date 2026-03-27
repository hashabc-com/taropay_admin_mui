import { toast } from 'sonner';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';

import { useCountries } from 'src/hooks/use-countries';

import { addRechargeRecord } from 'src/api/fund';
import { useAuthStore } from 'src/stores/auth-store';
import { useCountryStore } from 'src/stores/country-store';
import { useLanguage } from 'src/context/language-provider';
import { useMerchantStore } from 'src/stores/merchant-store';

// ----------------------------------------------------------------------

interface RechargeFormProps {
  onSuccess?: () => void;
}

const INITIAL_FORM = {
  currencyType: 'USD',
  exchangeRate: '',
  rechargeAmount: '',
  remark: '',
  rechargeKey: '',
  gauthCode: '',
};

export function RechargeForm({ onSuccess }: RechargeFormProps) {
  const { t } = useLanguage();
  const { selectedMerchant } = useMerchantStore();
  const { selectedCountry } = useCountryStore();
  const { userInfo } = useAuthStore();

  const { countries } = useCountries();
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currencyOptions = useMemo(
    () => [{ country: 'USDT', currency: 'USDT' } as any, ...countries],
    [countries]
  );

  // Calculated deposit amount
  const finalAmount = useMemo(() => {
    const amount = parseFloat(form.rechargeAmount) || 0;
    const rate = parseFloat(form.exchangeRate) || 0;
    return (amount * rate).toFixed(2);
  }, [form.rechargeAmount, form.exchangeRate]);

  const handleClear = useCallback(() => {
    setForm((prev) => ({ ...prev, rechargeAmount: '', exchangeRate: '' }));
  }, []);

  const resetForm = useCallback(() => {
    setForm(INITIAL_FORM);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedMerchant?.appid) {
      toast.error(t('common.pleaseSelectMerchantFirst'));
      return;
    }
    if (parseFloat(finalAmount) === 0) {
      toast.error(t('fund.accountSettlement.invalidAmount'));
      return;
    }
    if (!form.rechargeKey) {
      toast.error(t('common.pleaseEnterPassword'));
      return;
    }
    if (!form.gauthCode) {
      toast.error(t('common.enterGoogleAuthCode'));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await addRechargeRecord({
        currencyType: form.currencyType,
        customerAppid: selectedMerchant.appid,
        exchangeRate: parseFloat(form.exchangeRate),
        finalAmount: parseFloat(finalAmount),
        rechargeAmount: parseFloat(form.rechargeAmount),
        rechargeKey: form.rechargeKey,
        remark: form.remark,
        gauthCode: form.gauthCode,
        userid: userInfo?.id,
        country: selectedCountry?.code || '',
      });
      if (res.code == 200) {
        toast.success(t('fund.accountSettlement.rechargeSuccess'));
        resetForm();
        onSuccess?.();
      } else {
        toast.error(res.message || t('fund.accountSettlement.rechargeFailed'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [form, finalAmount, selectedMerchant, selectedCountry, userInfo, resetForm, onSuccess, t]);

  return (
    <Card>
      <CardHeader title={t('fund.accountSettlement.recharge')} />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Amount + Currency + Rate */}
        <Typography variant="subtitle2">{t('fund.accountSettlement.topUpAmount')}</Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            type="number"
            placeholder={t('fund.accountSettlement.enterRechargeAmount')}
            value={form.rechargeAmount}
            onChange={(e) => setForm((prev) => ({ ...prev, rechargeAmount: e.target.value }))}
            slotProps={{ htmlInput: { min: 0 } }}
            sx={{ flex: 1, minWidth: 120 }}
          />
          <TextField
            select
            size="small"
            label={t('fund.accountSettlement.currency')}
            value={form.currencyType}
            onChange={(e) => setForm((prev) => ({ ...prev, currencyType: e.target.value }))}
            sx={{ minWidth: 140 }}
          >
            {currencyOptions.map((item: any) => (
              <MenuItem key={item.currency} value={item.currency}>
                {item.country}({item.currency})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            type="number"
            placeholder={t('fund.rechargeWithdraw.exchangeRate')}
            value={form.exchangeRate}
            onChange={(e) => setForm((prev) => ({ ...prev, exchangeRate: e.target.value }))}
            slotProps={{ htmlInput: { min: 0 } }}
            sx={{ width: 120 }}
          />
          <Button variant="outlined" size="small" onClick={handleClear}>
            {t('common.clear')}
          </Button>
        </Box>

        {/* Calculated deposit amount */}
        <Typography variant="subtitle2">
          {t('fund.accountSettlement.actualDepositAmount')}
          {selectedCountry?.currency ? ` (${selectedCountry.currency})` : ''}
        </Typography>
        <TextField size="small" value={finalAmount} disabled fullWidth />

        {/* Remark */}
        <Typography variant="subtitle2">{t('fund.accountSettlement.remark')}</Typography>
        <TextField
          size="small"
          multiline
          rows={3}
          placeholder={t('common.enterRemark')}
          value={form.remark}
          onChange={(e) => setForm((prev) => ({ ...prev, remark: e.target.value }))}
          fullWidth
        />

        {/* Recharge password */}
        <Typography variant="subtitle2">{t('fund.accountSettlement.rechargePassword')}</Typography>
        <TextField
          size="small"
          type="password"
          placeholder={t('common.enterRechargePassword')}
          value={form.rechargeKey}
          onChange={(e) => setForm((prev) => ({ ...prev, rechargeKey: e.target.value }))}
          fullWidth
        />

        {/* Google auth code */}
        <Typography variant="subtitle2">{t('common.googleAuthCode')}</Typography>
        <TextField
          size="small"
          placeholder={t('common.enterGoogleAuthCode')}
          value={form.gauthCode}
          onChange={(e) => setForm((prev) => ({ ...prev, gauthCode: e.target.value }))}
          slotProps={{ htmlInput: { maxLength: 6 } }}
          fullWidth
        />

        {/* Submit */}
        <Button
          variant="contained"
          fullWidth
          onClick={handleSubmit}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {isSubmitting
            ? t('fund.accountSettlement.recharging')
            : t('fund.accountSettlement.recharge')}
        </Button>
      </CardContent>
    </Card>
  );
}
