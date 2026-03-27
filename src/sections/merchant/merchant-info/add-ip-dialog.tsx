import type { MerchantInfo } from 'src/api/merchant';

import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';

import { addIP } from 'src/api/merchant';
import { useLanguage } from 'src/context/language-provider';

import { Form, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

type AddIpDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchant: MerchantInfo | null;
  onSuccess: () => void;
};

export function AddIpDialog({ open, onOpenChange, merchant, onSuccess }: AddIpDialogProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        ip: z.string().min(1, t('merchant.info.validation.ipRequired')),
        googleCode: z.string().min(1, t('merchant.info.validation.googleCodeRequired')),
      }),
    [t]
  );

  type FormValues = z.infer<typeof schema>;

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { ip: '', googleCode: '' },
  });

  const { reset, handleSubmit } = methods;

  useEffect(() => {
    if (open) reset({ ip: '', googleCode: '' });
  }, [open, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!merchant) return;
    setLoading(true);
    try {
      const res = await addIP({
        merchantId: merchant.companyName,
        ip: values.ip,
        googleCode: values.googleCode,
      });

      if (res.code == 200) {
        toast.success(t('merchant.info.success.addSuccess'));
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(res.message || t('merchant.info.error.addFailed'));
      }
    } finally {
      setLoading(false);
    }
  });

  return (
    <Dialog open={open} onClose={() => !loading && onOpenChange(false)} maxWidth="xs" fullWidth>
      <DialogTitle>{t('merchant.info.addIP')}</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t('merchant.info.addIPFor')} <strong>{merchant?.companyName}</strong>
          </DialogContentText>

          <Stack spacing={2.5}>
            <RHFTextField
              name="ip"
              label={t('merchant.info.ipAddress')}
              placeholder={t('merchant.info.placeholder.ipAddress')}
              size="small"
              multiline
              rows={3}
            />
            <RHFTextField
              name="googleCode"
              label={t('common.googleAuthCode')}
              placeholder={t('common.googleAuthCodePlaceholder')}
              size="small"
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => onOpenChange(false)} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {loading ? t('common.submitting') : t('merchant.info.confirmAdd')}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
