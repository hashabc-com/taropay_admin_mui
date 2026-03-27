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

import { updatePass } from 'src/api/merchant';
import { useLanguage } from 'src/context/language-provider';

import { Form, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

type ChangePasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchant: MerchantInfo | null;
  onSuccess: () => void;
};

export function ChangePasswordDialog({
  open,
  onOpenChange,
  merchant,
  onSuccess,
}: ChangePasswordDialogProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const schema = useMemo(
    () =>
      z
        .object({
          pwd: z.string().min(6, t('merchant.info.validation.passwordMinLength')),
          rePwd: z.string().min(6, t('merchant.info.validation.passwordMinLength')),
        })
        .refine((data) => data.pwd === data.rePwd, {
          message: t('merchant.info.validation.passwordMismatch'),
          path: ['rePwd'],
        }),
    [t]
  );

  type FormValues = z.infer<typeof schema>;

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { pwd: '', rePwd: '' },
  });

  const { reset, handleSubmit } = methods;

  useEffect(() => {
    if (open) reset({ pwd: '', rePwd: '' });
  }, [open, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!merchant) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('id', merchant.id.toString());
      formData.append('pwd', values.pwd);
      formData.append('rePwd', values.rePwd);
      const res = await updatePass(formData);

      if (res.code == 200) {
        toast.success(t('merchant.info.success.passwordChanged'));
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(res.message || t('merchant.info.error.passwordChangeFailed'));
      }
    } finally {
      setLoading(false);
    }
  });

  return (
    <Dialog open={open} onClose={() => !loading && onOpenChange(false)} maxWidth="xs" fullWidth>
      <DialogTitle>{t('merchant.info.changePassword')}</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t('merchant.info.changePasswordFor')} <strong>{merchant?.companyName}</strong>
          </DialogContentText>

          <Stack spacing={2.5}>
            <RHFTextField
              name="pwd"
              label={t('merchant.info.placeholder.newPassword')}
              type="password"
              size="small"
            />
            <RHFTextField
              name="rePwd"
              label={t('merchant.info.confirmNewPassword')}
              type="password"
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
            {loading ? t('common.submitting') : t('merchant.info.confirmChange')}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
