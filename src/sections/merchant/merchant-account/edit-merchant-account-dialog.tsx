import type { MerchantUser } from 'src/api/merchant-user';

import { z } from 'zod';
import useSWR from 'swr';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import { useLanguage } from 'src/context/language-provider';
import { getAllUserList, createMerchantUser, updateMerchantUser } from 'src/api/merchant-user';

import { Iconify } from 'src/components/iconify';
import { Form, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

type MerchantOption = {
  appid: string;
  companyName: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchantUser: MerchantUser | null;
  isAdd: boolean;
  onSuccess: () => void;
};

export function EditMerchantAccountDialog({
  open,
  onOpenChange,
  merchantUser,
  isAdd,
  onSuccess,
}: Props) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [selectedMerchants, setSelectedMerchants] = useState<MerchantOption[]>([]);

  // Fetch all merchants for multi-select
  const { data: merchantData } = useSWR(open ? 'allUserList' : null, () => getAllUserList(), {
    revalidateOnFocus: false,
  });

  const merchantOptions: MerchantOption[] = useMemo(
    () =>
      (merchantData?.result || merchantData?.data || []).map(
        (item: { appid: string; companyName: string }) => ({
          appid: item.appid,
          companyName: item.companyName || item.appid,
        })
      ),
    [merchantData]
  );

  const schema = useMemo(
    () =>
      z.object({
        account: z.string().min(1, t('merchantAccount.validation.accountRequired')),
        accountName: z.string().min(1, t('merchantAccount.validation.accountNameRequired')),
        email: z.string().email(t('merchantAccount.validation.emailInvalid')),
        password: isAdd
          ? z.string().min(1, t('merchantAccount.validation.passwordRequired'))
          : z.string().optional(),
        remark: z.string().optional(),
        gauthKey: z.string().min(1, t('merchantAccount.validation.googleCodeRequired')),
      }),
    [t, isAdd]
  );

  type FormValues = z.infer<typeof schema>;

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      account: '',
      accountName: '',
      email: '',
      password: '',
      remark: '',
      gauthKey: '',
    },
  });

  const { reset, handleSubmit } = methods;

  useEffect(() => {
    if (open && merchantUser && !isAdd) {
      reset({
        account: merchantUser.account || '',
        accountName: merchantUser.accountName || '',
        email: merchantUser.email || '',
        password: '',
        remark: merchantUser.remark || '',
        gauthKey: '',
      });
      // Restore selected merchants from comma-separated appids
      if (merchantUser.appids) {
        const appidArr = merchantUser.appids.split(',').filter(Boolean);
        setSelectedMerchants(
          appidArr.map((appid) => {
            const found = merchantOptions.find((o) => o.appid === appid);
            return { appid, companyName: found?.companyName || appid };
          })
        );
      } else {
        setSelectedMerchants([]);
      }
    } else if (open && isAdd) {
      reset({
        account: '',
        accountName: '',
        email: '',
        password: '',
        remark: '',
        gauthKey: '',
      });
      setSelectedMerchants([]);
    }
  }, [open, merchantUser, isAdd, reset, merchantOptions]);

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    try {
      const appids = selectedMerchants.map((m) => m.appid).join(',');

      if (isAdd) {
        const res = await createMerchantUser({
          account: values.account,
          accountName: values.accountName,
          email: values.email,
          password: values.password!,
          appids,
          remark: values.remark,
          gauthKey: values.gauthKey,
        });
        if (res.code == 200) {
          toast.success(t('common.operationSuccess'));
          onOpenChange(false);
          onSuccess();
        } else {
          toast.error(res.result || t('common.operationFailed'));
        }
      } else {
        const res = await updateMerchantUser({
          id: merchantUser!.id,
          accountName: values.accountName,
          email: values.email,
          password: values.password || undefined,
          appids,
          remark: values.remark,
          gauthKey: values.gauthKey,
        });
        if (res.code == 200) {
          toast.success(t('common.operationSuccess'));
          onOpenChange(false);
          onSuccess();
        } else {
          toast.error(res.result || t('common.operationFailed'));
        }
      }
    } finally {
      setLoading(false);
    }
  });

  return (
    <Dialog open={open} onClose={() => onOpenChange(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isAdd ? t('merchantAccount.addAccount') : t('merchantAccount.editAccount')}
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 3 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={2.5}>
            <RHFTextField name="account" label={t('merchantAccount.account')} disabled={!isAdd} />
            <RHFTextField name="accountName" label={t('merchantAccount.accountName')} />
            <RHFTextField name="email" label={t('merchantAccount.email')} />
            {!isAdd && (
              <RHFTextField
                name="password"
                label={t('merchantAccount.newPassword')}
                type="password"
                placeholder={t('merchantAccount.passwordPlaceholder')}
              />
            )}

            <Autocomplete
              multiple
              options={merchantOptions}
              value={selectedMerchants}
              onChange={(_, newValue) => setSelectedMerchants(newValue)}
              getOptionLabel={(option) => `${option.companyName}`}
              isOptionEqualToValue={(option, value) => option.appid === value.appid}
              disableCloseOnSelect
              renderOption={(props, option, { selected }) => (
                <li {...props} key={option.appid}>
                  <Checkbox
                    icon={<Iconify icon="eva:square-outline" width={20} />}
                    checkedIcon={<Iconify icon="eva:checkmark-square-2-fill" width={20} />}
                    checked={selected}
                    sx={{ mr: 1 }}
                  />
                  {option.companyName}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('merchantAccount.bindMerchants')}
                  placeholder={t('merchantAccount.selectMerchants')}
                />
              )}
            />

            {isAdd && (
              <RHFTextField name="password" label={t('merchantAccount.password')} type="password" />
            )}

            <RHFTextField name="remark" label={t('merchantAccount.remark')} multiline rows={2} />
            <RHFTextField name="gauthKey" label={t('merchantAccount.googleCode')} />
          </Stack>
        </Form>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={() => onOpenChange(false)}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {loading ? t('common.submitting') : t('common.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
