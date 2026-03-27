import { toast } from 'sonner';
import { useState, useCallback } from 'react';

import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';

import { addWithdraw } from 'src/api/fund';
import { useCountryStore } from 'src/stores/country-store';
import { useLanguage } from 'src/context/language-provider';
import { useMerchantStore } from 'src/stores/merchant-store';

// ----------------------------------------------------------------------

interface WithdrawFormProps {
  onSuccess?: () => void;
}

const INITIAL_FORM = {
  finalAmount: '',
  remark: '',
  rechargeKey: '',
  gauthCode: '',
};

export function WithdrawForm({ onSuccess }: WithdrawFormProps) {
  const { t } = useLanguage();
  const { selectedMerchant } = useMerchantStore();
  const { selectedCountry } = useCountryStore();

  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setForm(INITIAL_FORM);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedMerchant?.appid) {
      toast.error(t('common.pleaseSelectMerchantFirst'));
      return;
    }
    if (!form.finalAmount || parseFloat(form.finalAmount) === 0) {
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
      const res = await addWithdraw({
        customerAppid: selectedMerchant.appid,
        rechargeAmount: parseFloat(form.finalAmount),
        exchangeRate: 1,
        currencyType: selectedCountry?.currency || '',
        country: selectedCountry?.code || '',
        finalAmount: form.finalAmount,
        remark: form.remark,
        rechargeKey: form.rechargeKey,
        gauthCode: form.gauthCode,
      });
      if (res.code == 200) {
        toast.success(t('fund.accountSettlement.withdrawSuccess'));
        resetForm();
        onSuccess?.();
      } else {
        toast.error(res.message || t('fund.accountSettlement.withdrawFailed'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [form, selectedMerchant, selectedCountry, resetForm, onSuccess, t]);

  return (
    <Card>
      <CardHeader title={t('fund.accountSettlement.withdraw')} />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Withdraw amount */}
        <Typography variant="subtitle2">{t('fund.accountSettlement.withdrawAmount')}</Typography>
        <TextField
          size="small"
          type="number"
          placeholder={t('fund.accountSettlement.enterWithdrawAmount')}
          value={form.finalAmount}
          onChange={(e) => setForm((prev) => ({ ...prev, finalAmount: e.target.value }))}
          slotProps={{ htmlInput: { min: 0 } }}
          fullWidth
        />

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

        {/* Withdraw password */}
        <Typography variant="subtitle2">{t('fund.accountSettlement.withdrawPassword')}</Typography>
        <TextField
          size="small"
          type="password"
          placeholder={t('common.enterWithdrawPassword')}
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
            ? t('fund.accountSettlement.withdrawing')
            : t('fund.accountSettlement.withdraw')}
        </Button>
      </CardContent>
    </Card>
  );
}
