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

import { getAutoLoginToken } from 'src/api/merchant';
import { useLanguage } from 'src/context/language-provider';

import { Form, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const isProduction = import.meta.env.MODE === 'production';

type AutoLoginDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchant: MerchantInfo | null;
};

export function AutoLoginDialog({ open, onOpenChange, merchant }: AutoLoginDialogProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        googleCode: z.string().min(1, t('merchant.info.validation.googleCodeRequired')),
      }),
    [t]
  );

  type FormValues = z.infer<typeof schema>;

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { googleCode: '' },
  });

  const { reset, handleSubmit } = methods;

  useEffect(() => {
    if (open) reset({ googleCode: '' });
  }, [open, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!merchant) return;
    setLoading(true);
    try {
      const res = await getAutoLoginToken(merchant.appid, values.googleCode);
      if (res.code == 200) {
        const baseUrl = isProduction
          ? 'https://merchant.taropay.com'
          : 'https://merchant-test.taropay.com';
        window.open(`${baseUrl}?token=${res.result}`, '_blank');
        onOpenChange(false);
      } else {
        toast.error(res.result || t('merchant.info.error.autoLoginFailed'));
      }
    } catch {
      toast.error(t('merchant.info.error.autoLoginFailed'));
    } finally {
      setLoading(false);
    }
  });

  return (
    <Dialog open={open} onClose={() => !loading && onOpenChange(false)} maxWidth="xs" fullWidth>
      <DialogTitle>{t('merchant.info.autoLogin')}</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
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
            {loading ? t('common.submitting') : t('common.confirm')}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
