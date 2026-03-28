import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { addCustomerConsult } from 'src/api/business';
import { useLanguage } from 'src/context/language-provider';

import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

const COUNTRY_CODES = [
  { value: '86', label: '+86' },
  { value: '1', label: '+1' },
  { value: '44', label: '+44' },
  { value: '81', label: '+81' },
  { value: '82', label: '+82' },
];

const COUNTRIES = [
  { value: 'CN', label: '中国' },
  { value: 'US', label: '美国' },
  { value: 'ID', label: '印度尼西亚' },
  { value: 'IN', label: '印度' },
  { value: 'BR', label: '巴西' },
  { value: 'TH', label: '泰国' },
  { value: 'VN', label: '越南' },
];

export function AddCustomerDialog({ open, onClose, onSuccess }: Props) {
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        contactPerson: z.string().min(1, t('business.customerConsult.pleaseEnterContactPerson')),
        countryCode: z.string().min(1),
        phone: z.string().min(1, t('business.customerConsult.pleaseEnterPhone')),
        email: z
          .string()
          .min(1, t('business.customerConsult.pleaseEnterEmail'))
          .email(t('business.customerConsult.pleaseEnterValidEmail')),
        company: z.string().optional(),
        source: z.string().optional(),
        country: z.string().min(1, t('business.customerConsult.pleaseSelectCountry')),
        consultContent: z.string().optional(),
        remark: z.string().optional(),
      }),
    [t]
  );

  type FormValues = z.infer<typeof schema>;

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      contactPerson: '',
      countryCode: '86',
      phone: '',
      email: '',
      company: '',
      source: '',
      country: '',
      consultContent: '',
      remark: '',
    },
  });

  useEffect(() => {
    if (!open) methods.reset();
  }, [open, methods]);

  const onSubmit = methods.handleSubmit(async (data) => {
    setSubmitting(true);
    try {
      const res = await addCustomerConsult(data);
      if (res.code == 200) {
        toast.success(t('common.operationSuccess'));
        onClose();
        onSuccess();
      }
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t('business.customerConsult.addCustomer')}</DialogTitle>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent dividers sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Field.Text
                name="contactPerson"
                label={`${t('business.customerConsult.contactPerson')} *`}
                placeholder={t('business.customerConsult.pleaseEnterContactPerson')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Grid container spacing={1}>
                <Grid size={4}>
                  <Field.Select
                    name="countryCode"
                    label={t('business.customerConsult.countryCode')}
                  >
                    {COUNTRY_CODES.map((c) => (
                      <MenuItem key={c.value} value={c.value}>
                        {c.label}
                      </MenuItem>
                    ))}
                  </Field.Select>
                </Grid>
                <Grid size={8}>
                  <Field.Text
                    name="phone"
                    label={`${t('business.customerConsult.phone')} *`}
                    placeholder={t('business.customerConsult.pleaseEnterPhone')}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Field.Text
                name="email"
                label={`${t('business.customerConsult.email')} *`}
                type="email"
                placeholder={t('business.customerConsult.pleaseEnterEmail')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Field.Text
                name="company"
                label={t('business.customerConsult.company')}
                placeholder={t('business.customerConsult.pleaseEnterCompany')}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Field.Select name="country" label={`${t('business.customerConsult.country')} *`}>
                {COUNTRIES.map((c) => (
                  <MenuItem key={c.value} value={c.value}>
                    {c.label}
                  </MenuItem>
                ))}
              </Field.Select>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Field.Text
                name="source"
                label={t('business.customerConsult.source')}
                placeholder={t('business.customerConsult.pleaseEnterSource')}
              />
            </Grid>
            <Grid size={12}>
              <Field.Text
                name="consultContent"
                label={t('business.customerConsult.consultContent')}
                placeholder={t('business.customerConsult.pleaseEnterConsultContent')}
                multiline
                rows={3}
              />
            </Grid>
            <Grid size={12}>
              <Field.Text
                name="remark"
                label={t('business.customerConsult.remark')}
                placeholder={t('common.enterRemark')}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {submitting ? t('common.submitting') : t('common.submit')}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
