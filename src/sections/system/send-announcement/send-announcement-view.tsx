import { z } from 'zod';
import useSWR from 'swr';
import { toast } from 'sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useCountries } from 'src/hooks/use-countries';

import { DashboardContent } from 'src/layouts/dashboard';
import { type Merchant } from 'src/stores/merchant-store';
import { useLanguage } from 'src/context/language-provider';
import { sendAnnouncement, getMerchantListBySend } from 'src/api/common';

import { Iconify } from 'src/components/iconify';
import { FlagIcon } from 'src/components/flag-icon';

// ----------------------------------------------------------------------

export function SendAnnouncementView() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const { countries } = useCountries();

  const schema = useMemo(
    () =>
      z.object({
        country: z.string().min(1, t('sendAnnouncement.validation.countryRequired')),
        appidList: z.array(z.string()).optional(),
        content: z.string().min(1, t('sendAnnouncement.validation.contentRequired')),
        gauthKey: z.string().length(6, t('sendAnnouncement.validation.googleCodeFormat')),
      }),
    [t]
  );

  type FormValues = z.infer<typeof schema>;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { country: '', appidList: [], content: '', gauthKey: '' },
  });

  const selectedCountryCode = watch('country');

  const { data: merchantsData } = useSWR(
    selectedCountryCode ? ['merchants-by-send', selectedCountryCode] : null,
    () => getMerchantListBySend(selectedCountryCode),
    { revalidateOnFocus: false }
  );

  const merchants: Merchant[] = (merchantsData?.result || []) as Merchant[];

  const onSubmit = useCallback(
    async (values: FormValues) => {
      setLoading(true);
      try {
        const res = await sendAnnouncement(values);
        if (res?.code == 200) {
          toast.success(t('sendAnnouncement.success'));
          reset();
        } else {
          toast.error(String(res?.result ?? '') || t('sendAnnouncement.failed'));
        }
      } finally {
        setLoading(false);
      }
    },
    [t, reset]
  );

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 3 }}>
        {t('sendAnnouncement.title')}
      </Typography>

      <Card sx={{ p: 3 }}>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 3 }}
        >
          {/* Country */}
          <FormControl error={!!errors.country}>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              {t('sendAnnouncement.country')}
            </Typography>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    setValue('appidList', []);
                  }}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                    gap: 1.5,
                  }}
                >
                  {countries.map((c) => (
                    <FormControlLabel
                      key={c.code}
                      value={c.code}
                      control={<Radio size="small" />}
                      label={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <FlagIcon code={c.code} />
                          <span>{c.code}</span>
                        </Stack>
                      }
                      sx={{
                        m: 0,
                        px: 2,
                        py: 1,
                        borderRadius: 1,
                        border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    />
                  ))}
                </RadioGroup>
              )}
            />
            {errors.country && <FormHelperText>{errors.country.message}</FormHelperText>}
          </FormControl>

          {/* Merchant List */}
          <FormControl>
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
              {t('sendAnnouncement.merchant')}
            </Typography>
            <Controller
              name="appidList"
              control={control}
              render={({ field }) => (
                <Box
                  sx={{
                    border: (theme) => `1px solid ${theme.vars.palette.divider}`,
                    borderRadius: 1,
                    p: 2,
                    maxHeight: 240,
                    overflow: 'auto',
                  }}
                >
                  {!selectedCountryCode ? (
                    <Typography variant="body2" color="text.secondary">
                      {t('common.pleaseSelectCountryFirst')}
                    </Typography>
                  ) : (
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                        gap: 0.5,
                      }}
                    >
                      {merchants.map((merchant) => {
                        const checked = (field.value || []).includes(merchant.appid);
                        return (
                          <FormControlLabel
                            key={merchant.appid}
                            control={
                              <Checkbox
                                size="small"
                                checked={checked}
                                onChange={(_, isChecked) => {
                                  const current = field.value || [];
                                  field.onChange(
                                    isChecked
                                      ? [...current, merchant.appid]
                                      : current.filter((id) => id !== merchant.appid)
                                  );
                                }}
                              />
                            }
                            label={merchant.companyName}
                            sx={{
                              m: 0,
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              '&:hover': { bgcolor: 'action.hover' },
                            }}
                          />
                        );
                      })}
                    </Box>
                  )}
                </Box>
              )}
            />
          </FormControl>

          {/* Content */}
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('sendAnnouncement.content')}
                placeholder={t('sendAnnouncement.placeholder.enterContent')}
                multiline
                minRows={4}
                error={!!errors.content}
                helperText={errors.content?.message}
              />
            )}
          />

          {/* Google Auth Code */}
          <Controller
            name="gauthKey"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('sendAnnouncement.googleCode')}
                placeholder={t('sendAnnouncement.placeholder.enterGoogleCode')}
                slotProps={{ htmlInput: { maxLength: 6 } }}
                error={!!errors.gauthKey}
                helperText={errors.gauthKey?.message}
                sx={{ maxWidth: 360 }}
              />
            )}
          />

          {/* Submit */}
          <Box>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Iconify icon="mdi:send" />
                )
              }
            >
              {loading ? t('common.submitting') : t('sendAnnouncement.send')}
            </Button>
          </Box>
        </Box>
      </Card>
    </DashboardContent>
  );
}
