import type { MerchantInfo } from 'src/api/merchant';

import { z } from 'zod';
import useSWR from 'swr';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useCountryStore } from 'src/stores/country-store';
import { useLanguage } from 'src/context/language-provider';
import { addCustomer, getQueueGroup, updateCustomer } from 'src/api/merchant';

import { Form, RHFSelect, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

type EditMerchantDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchant: MerchantInfo | null;
  isAdd: boolean;
  onSuccess: () => void;
};

export function EditMerchantDialog({
  open,
  onOpenChange,
  merchant,
  isAdd,
  onSuccess,
}: EditMerchantDialogProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const selectedCountry = useCountryStore((s) => s.selectedCountry);

  const { data: queueData } = useSWR(open ? 'queueGroup' : null, () => getQueueGroup(), {
    revalidateOnFocus: false,
  });

  const schema = useMemo(
    () =>
      z.object({
        account: z.string().min(1, t('merchant.info.validation.accountRequired')),
        // password: z.string().optional(),
        companyName: z.string().min(1, t('merchant.info.validation.merchantNameRequired')),
        callbackQueue: z.string().min(1, t('merchant.info.validation.callbackQueueRequired')),
        freezeType: z.number(),
        accountFreezeDay: z.number().min(0, t('merchant.info.validation.daysMinZero')),
        provice: z.string(),
        zipcode: z.string().nullable().optional(),
        gauthKey: z.string().min(1, t('merchant.info.validation.googleCodeRequired')),
      }),
    [t]
  );

  type FormValues = z.infer<typeof schema>;

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      account: '',
      // password: '',
      companyName: '',
      callbackQueue: '',
      freezeType: 0,
      accountFreezeDay: 0,
      provice: '0',
      zipcode: null,
      gauthKey: '',
    },
  });

  const { reset, handleSubmit, watch, setValue } = methods;
  const freezeType = watch('freezeType');

  useEffect(() => {
    if (open && merchant && !isAdd) {
      reset({
        account: merchant.account || '',
        companyName: merchant.companyName || '',
        callbackQueue: merchant.callbackQueue || '',
        freezeType: merchant.freezeType || 0,
        accountFreezeDay: merchant.accountFreezeDay ?? 0,
        provice: merchant.provice || '0',
        zipcode: merchant.zipcode ? String(merchant.zipcode) : null,
        gauthKey: '',
      });
    } else if (open && isAdd) {
      reset({
        account: '',
        // password: '',
        companyName: '',
        callbackQueue: '',
        freezeType: 0,
        accountFreezeDay: 0,
        provice: '0',
        zipcode: null,
        gauthKey: '',
      });
    }
  }, [open, merchant, isAdd, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (isAdd && !selectedCountry) {
      toast.warning(t('merchant.info.validation.countryRequired'));
      return;
    }

    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        account: values.account,
        companyName: values.companyName,
        callbackQueue: values.callbackQueue,
        freezeType: values.freezeType,
        accountFreezeDay: values.accountFreezeDay,
        provice: values.provice,
        zipcode: values.zipcode ? Number(values.zipcode) : null,
        gauthKey: values.gauthKey,
      };

      if (isAdd) {
        // params.password = values.password;
        params.country = selectedCountry;
      } else {
        params.id = merchant!.id;
        params.country = merchant!.country;
      }

      const api = isAdd ? addCustomer : updateCustomer;
      const res = await api(params);

      if (res.code == 200) {
        toast.success(isAdd ? t('common.operationSuccess') : t('common.operationSuccess'));
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(res.message || t('common.operationFailed'));
      }
    } finally {
      setLoading(false);
    }
  });

  const queueList: string[] = queueData?.result || [];

  return (
    <Dialog open={open} onClose={() => !loading && onOpenChange(false)} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isAdd ? t('merchant.info.addMerchant') : t('merchant.info.editMerchant')}
      </DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <RHFTextField name="account" label={t('merchant.info.account')} size="small" />

            {/* {isAdd && (
              <RHFTextField
                name="password"
                label={t('merchant.info.password')}
                type="password"
                size="small"
              />
            )} */}

            <RHFTextField name="companyName" label={t('merchant.info.merchantName')} size="small" />

            <RHFSelect name="callbackQueue" label={t('merchant.info.callbackQueue')} size="small">
              {queueList.map((queue) => (
                <MenuItem key={queue} value={queue}>
                  {queue}
                </MenuItem>
              ))}
            </RHFSelect>

            <FormControl>
              <FormLabel>{t('merchant.info.freezeType')}</FormLabel>
              <RadioGroup
                row
                value={String(freezeType)}
                onChange={(e) => setValue('freezeType', Number(e.target.value))}
              >
                <FormControlLabel
                  value="0"
                  control={<Radio size="small" />}
                  label={`${t('merchant.info.transactionDay')}(T)`}
                />
                <FormControlLabel
                  value="1"
                  control={<Radio size="small" />}
                  label={`${t('merchant.info.naturalDay')}(D)`}
                />
              </RadioGroup>
            </FormControl>

            <RHFTextField
              name="accountFreezeDay"
              label={t('merchant.info.settlementDays')}
              type="number"
              size="small"
            />

            <RHFTextField
              name="gauthKey"
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
