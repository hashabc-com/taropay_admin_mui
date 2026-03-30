import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { useCountries } from 'src/hooks/use-countries';

import { useLanguage } from 'src/context/language-provider';

import { type PaymentChannel } from './types';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  channel: PaymentChannel | null;
  isEdit: boolean;
};

export function PaymentChannelDialog({ open, onClose, onSubmit, channel, isEdit }: Props) {
  const { t } = useLanguage();
  const { countries } = useCountries();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    channelCode: '',
    channelName: '',
    channelDesc: '',
    singleMinAmount: '',
    singleMaxAmount: '',
    dailyMaxAmount: '',
    channelStatus: 1,
    transProcessTime: '',
    runTimeRange: '',
    country: '',
    remark: '',
  });

  useEffect(() => {
    if (open && isEdit && channel) {
      setForm({
        channelCode: channel.channelCode || '',
        channelName: channel.channelName || '',
        channelDesc: channel.channelDesc || '',
        singleMinAmount: channel.singleMinAmount?.toString() || '',
        singleMaxAmount: channel.singleMaxAmount?.toString() || '',
        dailyMaxAmount: channel.dailyMaxAmount?.toString() || '',
        channelStatus: channel.channelStatus || 1,
        transProcessTime: channel.transProcessTime || '',
        runTimeRange: channel.runTimeRange || '',
        country: channel.country || '',
        remark: channel.remark || '',
      });
    } else if (open && !isEdit) {
      setForm({
        channelCode: '',
        channelName: '',
        channelDesc: '',
        singleMinAmount: '',
        singleMaxAmount: '',
        dailyMaxAmount: '',
        channelStatus: 1,
        transProcessTime: '',
        runTimeRange: '',
        country: '',
        remark: '',
      });
    }
  }, [open, isEdit, channel]);

  const isValid = useMemo(
    () => form.channelCode.trim() !== '' && form.channelName.trim() !== '',
    [form.channelCode, form.channelName]
  );

  const handleSubmit = useCallback(async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        ...form,
        singleMinAmount: form.singleMinAmount ? Number(form.singleMinAmount) : undefined,
        singleMaxAmount: form.singleMaxAmount ? Number(form.singleMaxAmount) : undefined,
        dailyMaxAmount: form.dailyMaxAmount ? Number(form.dailyMaxAmount) : undefined,
      };
      if (isEdit && channel) {
        payload.id = channel.id;
      }
      await onSubmit(payload);
    } finally {
      setLoading(false);
    }
  }, [isValid, form, isEdit, channel, onSubmit]);

  const setField = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? t('config.paymentChannel.editChannel') : t('config.paymentChannel.addChannel')}
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <TextField
            size="small"
            label={t('config.paymentChannel.channelCode')}
            value={form.channelCode}
            onChange={(e) => setField('channelCode', e.target.value)}
            disabled={isEdit}
            required
          />
          <TextField
            size="small"
            label={t('config.paymentChannel.channelName')}
            value={form.channelName}
            onChange={(e) => setField('channelName', e.target.value)}
            required
          />
        </Box>

        <TextField
          size="small"
          label={t('config.paymentChannel.channelDesc')}
          value={form.channelDesc}
          onChange={(e) => setField('channelDesc', e.target.value)}
          multiline
          rows={2}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
          <TextField
            size="small"
            label={t('config.paymentChannel.singleMinAmount')}
            type="number"
            value={form.singleMinAmount}
            onChange={(e) => setField('singleMinAmount', e.target.value)}
          />
          <TextField
            size="small"
            label={t('config.paymentChannel.singleMaxAmount')}
            type="number"
            value={form.singleMaxAmount}
            onChange={(e) => setField('singleMaxAmount', e.target.value)}
          />
          <TextField
            size="small"
            label={t('config.paymentChannel.dailyMaxAmount')}
            type="number"
            value={form.dailyMaxAmount}
            onChange={(e) => setField('dailyMaxAmount', e.target.value)}
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <TextField
            size="small"
            label={t('config.paymentChannel.transProcessTime')}
            value={form.transProcessTime}
            onChange={(e) => setField('transProcessTime', e.target.value)}
            placeholder="1-3秒、T+1"
          />
          <TextField
            size="small"
            label={t('config.paymentChannel.runTimeRange')}
            value={form.runTimeRange}
            onChange={(e) => setField('runTimeRange', e.target.value)}
            placeholder="00:00-24:00"
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <FormControl size="small">
            <InputLabel>{t('common.country')}</InputLabel>
            <Select
              label={t('common.country')}
              value={form.country}
              onChange={(e) => setField('country', e.target.value)}
              disabled={isEdit}
            >
              {countries.map((c) => (
                <MenuItem key={c.code} value={c.code}>
                  {t(`common.countrys.${c.code}`) || c.code}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel>{t('common.status')}</InputLabel>
            <Select
              label={t('common.status')}
              value={form.channelStatus}
              onChange={(e) => setField('channelStatus', Number(e.target.value))}
              disabled={isEdit}
            >
              <MenuItem value={1}>{t('config.paymentChannel.statusNormal')}</MenuItem>
              <MenuItem value={2}>{t('config.paymentChannel.statusMaintenance')}</MenuItem>
              <MenuItem value={3}>{t('config.paymentChannel.statusPaused')}</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TextField
          size="small"
          label={t('common.enterRemark')}
          value={form.remark}
          onChange={(e) => setField('remark', e.target.value)}
          multiline
          rows={2}
        />
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isValid || loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {loading ? t('common.submitting') : t('common.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
