import type { MerchantRequest } from './types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { useLanguage } from 'src/context/language-provider';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  record: MerchantRequest | null;
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '160px 1fr',
        gap: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        pb: 1.5,
      }}
    >
      <Typography variant="subtitle2" color="text.secondary">
        {label}:
      </Typography>
      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
        {value}
      </Typography>
    </Box>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Typography
      variant="subtitle1"
      sx={{ fontWeight: 700, borderBottom: 2, borderColor: 'divider', pb: 1, pt: 2 }}
    >
      {children}
    </Typography>
  );
}

function JsonBlock({ label, value }: { label: string; value: string | undefined }) {
  if (!value) return null;

  const formatted = (() => {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  })();

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        {label}:
      </Typography>
      <Box
        component="pre"
        sx={{
          maxHeight: 250,
          overflow: 'auto',
          bgcolor: 'action.hover',
          borderRadius: 1,
          p: 2,
          fontSize: 'caption.fontSize',
          fontFamily: 'monospace',
          lineHeight: 1.8,
        }}
      >
        {formatted}
      </Box>
    </Box>
  );
}

export function MerchantRequestDetailDialog({ open, onClose, record }: Props) {
  const { t } = useLanguage();

  if (!record) return null;

  const getTransactionTypeLabel = (type?: string) => {
    if (!type) return '-';
    const map: Record<string, string> = {
      P: t('logs.merchantRequest.payment'),
      L: t('logs.merchantRequest.lending'),
    };
    return map[type] || type;
  };

  const getStatusLabel = (status?: number) => {
    if (status === undefined) return '-';
    const map: Record<number, string> = {
      0: t('logs.merchantRequest.statusSuccess'),
      1: t('logs.merchantRequest.statusProcessing'),
      2: t('logs.merchantRequest.statusFailed'),
      3: t('logs.merchantRequest.statusExpired'),
    };
    return map[status] ?? String(status);
  };

  const getCallbackStatusLabel = (status?: string) => {
    if (!status) return '-';
    const map: Record<string, string> = {
      '0': t('logs.merchantRequest.callbackSuccess'),
      '1': t('logs.merchantRequest.callbackPending'),
      '2': t('logs.merchantRequest.callbackFailed'),
    };
    return map[status] ?? status;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t('logs.merchantRequest.logDetail')}</DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Stack spacing={2}>
          {/* Basic Info */}
          <SectionTitle>{t('logs.merchantRequest.basicInfo')}</SectionTitle>
          <InfoRow
            label={t('logs.merchantRequest.transactionType')}
            value={getTransactionTypeLabel(record.transactionType)}
          />
          <InfoRow label={t('logs.merchantRequest.appid')} value={record.appid || '-'} />
          <InfoRow
            label={t('logs.merchantRequest.referenceno')}
            value={
              record.transactionType === 'P'
                ? record.referenceno || '-'
                : record.transactionReferenceNo || '-'
            }
          />
          <InfoRow
            label={t('logs.merchantRequest.transId')}
            value={
              record.transactionType === 'P' ? record.transId || '-' : record.transactionid || '-'
            }
          />
          <InfoRow label={t('logs.merchantRequest.parameTwo')} value={record.parameTwo || '-'} />
          <InfoRow label={t('logs.merchantRequest.country')} value={record.country || '-'} />
          <InfoRow label={t('logs.merchantRequest.status')} value={getStatusLabel(record.status)} />
          <InfoRow
            label={t('logs.merchantRequest.callBackStatus')}
            value={getCallbackStatusLabel(record.callBackStatus)}
          />

          {/* User Info */}
          <SectionTitle>{t('logs.merchantRequest.userInfo')}</SectionTitle>
          <InfoRow label={t('logs.merchantRequest.userName')} value={record.userName || '-'} />
          <InfoRow label={t('logs.merchantRequest.mobile')} value={record.mobile || '-'} />
          <InfoRow label={t('logs.merchantRequest.address')} value={record.address || '-'} />

          {/* Amount Info */}
          <SectionTitle>{t('logs.merchantRequest.amountInfo')}</SectionTitle>
          <InfoRow label={t('logs.merchantRequest.amount')} value={record.amount} />
          <InfoRow label={t('logs.merchantRequest.serviceAmount')} value={record.serviceAmount} />

          {/* Payment Info */}
          <SectionTitle>{t('logs.merchantRequest.paymentInfo')}</SectionTitle>
          <InfoRow
            label={t('logs.merchantRequest.paymentCompany')}
            value={record.paymentCompany || '-'}
          />
          <InfoRow
            label={t('logs.merchantRequest.pickupCenter')}
            value={record.pickupCenter || '-'}
          />
          <InfoRow label={t('logs.merchantRequest.url')} value={record.url || '-'} />
          <InfoRow
            label={t('logs.merchantRequest.notificationUrl')}
            value={record.callbackUrl || '-'}
          />

          {/* Time Info */}
          <SectionTitle>{t('logs.merchantRequest.timeInfo')}</SectionTitle>
          <InfoRow label={t('logs.merchantRequest.createTime')} value={record.createTime || '-'} />
          <InfoRow label={t('logs.merchantRequest.updateTime')} value={record.updateTime || '-'} />
          <InfoRow label={t('logs.merchantRequest.localTime')} value={record.localTime || '-'} />

          {/* Request / Response Params */}
          <SectionTitle>{t('logs.merchantRequest.requestResponseParams')}</SectionTitle>
          <JsonBlock label={t('logs.merchantRequest.requestParam')} value={record.requestParam} />
          <JsonBlock label={t('logs.merchantRequest.responseParam')} value={record.responseParam} />
          <JsonBlock label={t('logs.merchantRequest.request')} value={record.request} />
          <JsonBlock label={t('logs.merchantRequest.response')} value={record.response} />
          <JsonBlock
            label={t('logs.merchantRequest.notifyParams')}
            value={record.notifyParam ?? undefined}
          />
          <JsonBlock
            label={t('logs.merchantRequest.callbackRequest')}
            value={record.callbackRequest}
          />
          <JsonBlock
            label={t('logs.merchantRequest.callbackResponse')}
            value={record.callbackResponse}
          />

          {record.callbackResponseStatus && (
            <InfoRow
              label={t('logs.merchantRequest.callbackResponseStatus')}
              value={record.callbackResponseStatus}
            />
          )}
          {record.callbackResponseTime && (
            <InfoRow
              label={t('logs.merchantRequest.callbackResponseTime')}
              value={`${record.callbackResponseTime}ms`}
            />
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          {t('common.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
