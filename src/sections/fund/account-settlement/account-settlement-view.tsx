import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';

import { updateExchangeRate } from 'src/api/fund';
import { DashboardContent } from 'src/layouts/dashboard';
import { useCountryStore } from 'src/stores/country-store';
import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

import { RechargeForm } from './recharge-form';
import { WithdrawForm } from './withdraw-form';
import { useExchangeRate, useAccountAmount } from './hooks';

// ----------------------------------------------------------------------

export function AccountSettlementView() {
  const { t } = useLanguage();
  const { selectedCountry } = useCountryStore();
  const { data: accountData, mutate: refetchAmount } = useAccountAmount();
  const { data: rateData, mutate: refetchRate } = useExchangeRate();

  const [rateDialogOpen, setRateDialogOpen] = useState(false);
  const [rateForm, setRateForm] = useState({ name: '', gauthCode: '' });
  const [isUpdatingRate, setIsUpdatingRate] = useState(false);

  // Sync rate data
  useEffect(() => {
    if (rateData?.name) {
      setTimeout(() => {
        setRateForm((prev) => ({ ...prev, name: rateData.name || '' }));
      }, 10);
    }
  }, [rateData]);

  const handleUpdateRate = useCallback(async () => {
    if (!rateForm.name) {
      toast.error(t('common.pleaseEnterRate'));
      return;
    }
    if (!rateForm.gauthCode) {
      toast.error(t('common.enterGoogleAuthCode'));
      return;
    }

    setIsUpdatingRate(true);
    try {
      const res = await updateExchangeRate({
        name: rateForm.name,
        gauthCode: rateForm.gauthCode,
        data: rateData?.provinceCode,
      });
      if (res.code == 200) {
        toast.success(t('fund.accountSettlement.rateUpdateSuccess'));
        setRateForm({ name: rateForm.name, gauthCode: '' });
        setRateDialogOpen(false);
        refetchRate();
      } else {
        toast.error(res?.message || t('fund.accountSettlement.rateUpdateFailed'));
      }
    } finally {
      setIsUpdatingRate(false);
    }
  }, [rateForm, rateData, refetchRate, t]);

  return (
    <DashboardContent maxWidth="xl">
      {/* Title + Rate info */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4">{t('fund.accountSettlement.title')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('fund.accountSettlement.currentRate')}: {rateData?.name || '0'}
            {' | '}
            {t('fund.accountSettlement.rateUpdateTime')}: {rateData?.provinceCode || '-'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<Iconify icon="solar:refresh-bold" />}
          onClick={() => setRateDialogOpen(true)}
        >
          {t('fund.accountSettlement.updateRate')}
        </Button>
      </Box>

      {/* Stats cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('fund.accountSettlement.availableBalance')}{' '}
                {selectedCountry?.currency ? `(${selectedCountry.currency})` : ''}
              </Typography>
              <Typography variant="h4">{accountData?.availableAmount || '0'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('fund.accountSettlement.unsettledFunds')}{' '}
                {selectedCountry?.currency ? `(${selectedCountry.currency})` : ''}
              </Typography>
              <Typography variant="h4">{accountData?.frozenAmount || '0'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('fund.accountSettlement.rechargeAmount')}{' '}
                {selectedCountry?.currency ? `(${selectedCountry.currency})` : ''}
              </Typography>
              <Typography variant="h4">{accountData?.rechargeAmount || '0'}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recharge & Withdraw forms */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <RechargeForm onSuccess={() => refetchAmount()} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <WithdrawForm onSuccess={() => refetchAmount()} />
        </Grid>
      </Grid>

      {/* Update Rate Dialog */}
      <Dialog
        open={rateDialogOpen}
        onClose={() => setRateDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t('fund.accountSettlement.updateRate')}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t('fund.accountSettlement.enterNewRateAndGoogleCode')}
          </DialogContentText>
          <TextField
            fullWidth
            size="small"
            label={t('fund.accountSettlement.currentRate')}
            value={rateForm.name}
            onChange={(e) => setRateForm((prev) => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            size="small"
            label={t('common.googleAuthCode')}
            placeholder={t('common.enterGoogleAuthCode')}
            value={rateForm.gauthCode}
            onChange={(e) => setRateForm((prev) => ({ ...prev, gauthCode: e.target.value }))}
            slotProps={{ htmlInput: { maxLength: 6 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setRateDialogOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateRate}
            disabled={isUpdatingRate}
            startIcon={isUpdatingRate ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {isUpdatingRate ? t('common.updating') : t('common.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
