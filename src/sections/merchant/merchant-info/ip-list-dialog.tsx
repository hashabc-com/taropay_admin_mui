import type { MerchantInfo } from 'src/api/merchant';

import { z } from 'zod';
import useSWR from 'swr';
import { toast } from 'sonner';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import DialogContentText from '@mui/material/DialogContentText';

import { delIp, getIpList } from 'src/api/merchant';
import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';
import { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

type IpListDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    merchant: MerchantInfo | null;
    onSuccess: () => void;
};

type IpItem = string | { id?: number | string; ip: string };

const getIpString = (item: IpItem) => (typeof item === 'string' ? item : item.ip);

export function IpListDialog({ open, onOpenChange, merchant, onSuccess }: IpListDialogProps) {
    const { t } = useLanguage();
    const [deletingIp, setDeletingIp] = useState<string | null>(null);

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

    const { reset, getValues, trigger } = methods;

    useEffect(() => {
        if (open) reset({ googleCode: '' });
    }, [open, reset]);

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

    const handleDelete = async (ip: string) => {
        if (!merchant) return;
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
        <Dialog
            open={open}
            onClose={() => !deletingIp && onOpenChange(false)}
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle>{t('merchant.info.viewIpList')}</DialogTitle>

            <FormProvider {...methods}>
                <DialogContent sx={{ pt: 3 }}>
                    <DialogContentText sx={{ mb: 2 }}>
                        {t('merchant.info.ipListFor')} <strong>{merchant?.companyName}</strong>
                    </DialogContentText>

                    <RHFTextField
                        name="googleCode"
                        label={t('common.googleAuthCode')}
                        placeholder={t('common.googleAuthCodePlaceholder')}
                        size="small"
                        sx={{ mb: 2 }}
                    />

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
                                maxHeight: 300,
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
                                                    disabled={!!deletingIp}
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
                    <Button onClick={() => onOpenChange(false)} disabled={!!deletingIp}>
                        {t('common.close')}
                    </Button>
                </DialogActions>
            </FormProvider>
        </Dialog>
    );
}
