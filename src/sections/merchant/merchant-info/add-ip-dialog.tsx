import type { MerchantInfo } from 'src/api/merchant';

import { z } from 'zod';
import useSWR from 'swr';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';

import { addIP, delIp, getIpList } from 'src/api/merchant';
import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';
import { Form, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

type AddIpDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchant: MerchantInfo | null;
  onSuccess: () => void;
};

type IpItem = string | { id?: number | string; ip: string };

const getIpString = (item: IpItem) => (typeof item === 'string' ? item : item.ip);

export function AddIpDialog({ open, onOpenChange, merchant, onSuccess }: AddIpDialogProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [deletingIp, setDeletingIp] = useState<string | null>(null);

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

  const { reset, handleSubmit, getValues, trigger } = methods;

  useEffect(() => {
    if (open) reset({ ip: '', googleCode: '' });
  }, [open, reset]);

  // IP 列表
  const swrKey = open && merchant?.companyName ? ['ipList', merchant.companyName] : null;
  const {
    data: ipListRes,
    isLoading: listLoading,
    mutate,
  } = useSWR(swrKey, () => getIpList({ customerName: merchant!.companyName }), {
    revalidateOnFocus: false,
  });

  const ipList = useMemo<IpItem[]>(() => {
    const result = ipListRes?.result;
    if (!Array.isArray(result)) return [];
    return result as IpItem[];
  }, [ipListRes]);

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
        reset({ ip: '', googleCode: values.googleCode });
        await mutate();
        onSuccess();
      } else {
        toast.error(res.message || t('merchant.info.error.addFailed'));
      }
    } finally {
      setLoading(false);
    }
  });

  const handleDelete = async (ip: string) => {
    if (!merchant) return;
    // 删除也需要 Google 验证码：要求用户先在表单中输入
    const ok = await trigger('googleCode');
    if (!ok) {
      toast.error(t('merchant.info.validation.googleCodeRequired'));
      return;
    }
    const googleCode = getValues('googleCode');

    setDeletingIp(ip);
    try {
      const res = await delIp({
        merchantId: merchant.companyName,
        ip,
        googleCode,
      });
      if (res.code == 200) {
        toast.success(t('merchant.info.success.deleteSuccess'));
        await mutate();
        onSuccess();
      } else {
        toast.error(res.message || t('merchant.info.error.deleteFailed'));
      }
    } finally {
      setDeletingIp(null);
    }
  };

  return (
    <Dialog open={open} onClose={() => !loading && onOpenChange(false)} maxWidth="xs" fullWidth>
      <DialogTitle>{t('merchant.info.addIP')}</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent sx={{ pt: 3 }}>
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

          <Divider sx={{ my: 2.5 }} />

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t('merchant.info.ipList')}
          </Typography>

          {listLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={20} />
            </Box>
          ) : ipList.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', py: 1 }}>
              {t('common.noData')}
            </Typography>
          ) : (
            <Stack
              spacing={0.5}
              sx={{
                maxHeight: 200,
                overflowY: 'auto',
                bgcolor: 'background.neutral',
                borderRadius: 1,
                p: 1,
              }}
            >
              {ipList.map((item, idx) => {
                const ip = getIpString(item);
                const isDeleting = deletingIp === ip;
                return (
                  <Box
                    key={`${ip}-${idx}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 1,
                      py: 0.5,
                      borderRadius: 0.75,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                      {ip}
                    </Typography>
                    <Tooltip title={t('merchant.info.deleteIp')}>
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={!!deletingIp || loading}
                          onClick={() => handleDelete(ip)}
                        >
                          {isDeleting ? (
                            <CircularProgress size={14} color="inherit" />
                          ) : (
                            <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                );
              })}
            </Stack>
          )}
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
