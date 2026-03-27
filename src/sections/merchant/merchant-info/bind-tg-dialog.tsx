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

import { bindTgGroup } from 'src/api/merchant';
import { useLanguage } from 'src/context/language-provider';

import { Form, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

type BindTgDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchant: MerchantInfo | null;
  onSuccess: () => void;
};

export function BindTgDialog({ open, onOpenChange, merchant, onSuccess }: BindTgDialogProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        chatId: z.string().min(1, t('merchant.info.validation.chatIdRequired')),
      }),
    [t]
  );

  type FormValues = z.infer<typeof schema>;

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { chatId: '' },
  });

  const { reset, handleSubmit } = methods;

  useEffect(() => {
    if (open) reset({ chatId: '' });
  }, [open, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!merchant) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('merchantId', merchant.appid);
      formData.append('chatId', values.chatId);

      const res = await bindTgGroup(formData);

      if (res.code == 200) {
        toast.success(t('merchant.info.success.bindTgGroupSuccess'));
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(res.message || t('merchant.info.error.bindTgGroupFailed'));
      }
    } finally {
      setLoading(false);
    }
  });

  return (
    <Dialog open={open} onClose={() => !loading && onOpenChange(false)} maxWidth="xs" fullWidth>
      <DialogTitle>{t('merchant.info.bindTgGroup')}</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <RHFTextField
              name="chatId"
              label={t('merchant.info.chatId')}
              placeholder={t('merchant.info.placeholder.chatId')}
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
            {loading ? t('common.submitting') : t('merchant.info.confirmBind')}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
