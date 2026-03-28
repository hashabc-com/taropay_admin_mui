import type { FollowRecord, CustomerConsultRecord } from './hooks';

import { z } from 'zod';
import useSWR from 'swr';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Drawer from '@mui/material/Drawer';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import { useLanguage } from 'src/context/language-provider';
import { addFollowRecord, getFollowRecordList } from 'src/api/business';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

type Props = {
  customer: CustomerConsultRecord | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function FollowUpDrawer({ customer, open, onClose, onSuccess }: Props) {
  const { t } = useLanguage();
  const [addOpen, setAddOpen] = useState(false);

  // Fetch follow records
  const {
    data: followRecords,
    isLoading,
    mutate: mutateRecords,
  } = useSWR(
    customer?.id ? ['follow-records', customer.id] : null,
    () => getFollowRecordList(customer!.id).then((res) => (res as any)?.result || []),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (!open) setAddOpen(false);
  }, [open]);

  const handleAddSuccess = () => {
    setAddOpen(false);
    mutateRecords();
    onSuccess();
  };

  const getFollowTypeIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      PHONE: 'solar:phone-bold',
      EMAIL: 'solar:letter-bold',
      VISIT: 'solar:buildings-2-bold',
      WECHAT: 'ic:baseline-wechat',
      OTHER: 'solar:chat-round-dots-bold',
    };
    return iconMap[type] || iconMap.OTHER;
  };

  const getResultColor = (result: string) => {
    const colorMap: Record<string, 'success' | 'info' | 'warning' | 'error'> = {
      SUCCESS: 'success',
      INTERESTED: 'info',
      CONSIDERING: 'warning',
      REFUSED: 'error',
    };
    return colorMap[result] || 'default';
  };

  return (
    <Drawer open={open} onClose={onClose} anchor="right" PaperProps={{ sx: { width: 600 } }}>
      {customer && (
        <>
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <Typography variant="h6" sx={{ mb: 2 }}>
              {t('business.customerConsult.followUpRecords')}
            </Typography>

            {/* Customer Info */}
            <Card sx={{ mb: 3, bgcolor: 'background.neutral' }}>
              <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify icon="solar:user-bold" width={18} sx={{ color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {t('business.customerConsult.contactPerson')}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {customer.contactPerson || '-'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid size={6}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify
                        icon="solar:phone-bold"
                        width={18}
                        sx={{ color: 'text.secondary' }}
                      />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {t('business.customerConsult.phone')}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {customer.phone ? `+${customer.countryCode} ${customer.phone}` : '-'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid size={6}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify
                        icon="solar:buildings-2-bold"
                        width={18}
                        sx={{ color: 'text.secondary' }}
                      />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {t('business.customerConsult.company')}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {customer.company || '-'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid size={6}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify
                        icon="solar:letter-bold"
                        width={18}
                        sx={{ color: 'text.secondary' }}
                      />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {t('business.customerConsult.email')}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" noWrap>
                          {customer.email || '-'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  {customer.consultContent && (
                    <Grid size={12}>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <Iconify
                          icon="solar:chat-round-dots-bold"
                          width={18}
                          sx={{ color: 'text.secondary', mt: 0.5 }}
                        />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {t('business.customerConsult.consultContent')}
                          </Typography>
                          <Typography variant="body2">{customer.consultContent}</Typography>
                        </Box>
                      </Stack>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* Add Follow-up Button */}
            <Button
              variant="contained"
              fullWidth
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => setAddOpen(true)}
              sx={{ mb: 3 }}
            >
              {t('business.customerConsult.addFollowUp')}
            </Button>

            {/* Follow Records */}
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
            >
              <Typography variant="subtitle2">
                {t('business.customerConsult.historyRecords')}
              </Typography>
              {followRecords?.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {followRecords.length} {t('business.customerConsult.records')}
                </Typography>
              )}
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              {isLoading ? (
                <Stack spacing={2}>
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} variant="rounded" height={120} />
                  ))}
                </Stack>
              ) : followRecords?.length > 0 ? (
                <Stack spacing={2}>
                  {followRecords.map((record: FollowRecord) => (
                    <Card key={record.id} variant="outlined">
                      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            mb: 1,
                          }}
                        >
                          <Stack direction="row" spacing={1}>
                            <Label
                              variant="outlined"
                              startIcon={<Iconify icon={getFollowTypeIcon(record.followType)} />}
                            >
                              {t(`business.customerConsult.followTypeValues.${record.followType}`)}
                            </Label>
                            <Label color={getResultColor(record.followResult)}>
                              {t(
                                `business.customerConsult.followResultValues.${record.followResult}`
                              )}
                            </Label>
                          </Stack>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            <Iconify
                              icon="solar:calendar-bold"
                              width={14}
                              sx={{ mr: 0.5, verticalAlign: 'text-bottom' }}
                            />
                            {record.followAt
                              ? new Date(record.followAt).toLocaleString('zh-CN', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '-'}
                          </Typography>
                        </Box>

                        <Typography variant="caption" color="text.secondary">
                          {t('business.customerConsult.followContent')}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
                          {record.followContent}
                        </Typography>

                        {record.remark && (
                          <Box sx={{ bgcolor: 'background.neutral', borderRadius: 1, p: 1, mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {t('business.customerConsult.remark')}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ whiteSpace: 'pre-wrap' }}
                            >
                              {record.remark}
                            </Typography>
                          </Box>
                        )}

                        {record.followBy && (
                          <Typography variant="caption" color="text.secondary">
                            <Iconify
                              icon="solar:user-bold"
                              width={14}
                              sx={{ mr: 0.5, verticalAlign: 'text-bottom' }}
                            />
                            {t('business.customerConsult.followBy')}: {record.followBy}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
                  <Iconify
                    icon="solar:chat-round-dots-bold"
                    width={48}
                    sx={{ color: 'text.disabled', mb: 1 }}
                  />
                  <Typography color="text.secondary">{t('common.noData')}</Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Add Follow-up Dialog */}
          <AddFollowDialog
            open={addOpen}
            customerId={customer?.id ?? 0}
            onClose={() => setAddOpen(false)}
            onSuccess={handleAddSuccess}
          />
        </>
      )}
    </Drawer>
  );
}

// ----------------------------------------------------------------------

type AddFollowDialogProps = {
  open: boolean;
  customerId: number;
  onClose: () => void;
  onSuccess: () => void;
};

function AddFollowDialog({ open, customerId, onClose, onSuccess }: AddFollowDialogProps) {
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        followType: z.string().min(1, t('business.customerConsult.pleaseSelectFollowType')),
        followContent: z.string().min(1, t('business.customerConsult.pleaseEnterFollowContent')),
        followResult: z.string().min(1, t('business.customerConsult.pleaseSelectFollowResult')),
        remark: z.string().optional(),
      }),
    [t]
  );

  type FormValues = z.infer<typeof schema>;

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { followType: '', followContent: '', followResult: '', remark: '' },
  });

  useEffect(() => {
    if (!open) methods.reset();
  }, [open, methods]);

  const onSubmit = methods.handleSubmit(async (data) => {
    setSubmitting(true);
    try {
      const res = await addFollowRecord({ customerId, ...data });
      if (res.code == 200) {
        toast.success(t('common.operationSuccess'));
        onSuccess();
      }
    } finally {
      setSubmitting(false);
    }
  });

  const followTypes = ['PHONE', 'VISIT', 'EMAIL', 'WECHAT', 'OTHER'] as const;
  const followResults = ['INTERESTED', 'CONSIDERING', 'REFUSED', 'SUCCESS'] as const;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('business.customerConsult.addFollowUp')}</DialogTitle>
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent dividers sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <Field.Select
                name="followType"
                label={`${t('business.customerConsult.followType')} *`}
              >
                {followTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {t(`business.customerConsult.followTypeValues.${type}`)}
                  </MenuItem>
                ))}
              </Field.Select>
            </Grid>
            <Grid size={6}>
              <Field.Select
                name="followResult"
                label={`${t('business.customerConsult.followResult')} *`}
              >
                {followResults.map((result) => (
                  <MenuItem key={result} value={result}>
                    {t(`business.customerConsult.followResultValues.${result}`)}
                  </MenuItem>
                ))}
              </Field.Select>
            </Grid>
            <Grid size={12}>
              <Field.Text
                name="followContent"
                label={`${t('business.customerConsult.followContent')} *`}
                placeholder={t('business.customerConsult.pleaseEnterFollowContent')}
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
