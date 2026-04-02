import type { MessageRecord } from './types';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
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
  record: MessageRecord | null;
};

const CONSUME_STATUS_COLOR: Record<number, 'error' | 'success' | 'warning'> = {
  0: 'error',
  1: 'success',
  2: 'warning',
};

export function MessageDetailDialog({ open, onClose, record }: Props) {
  const { t } = useLanguage();

  if (!record) return null;

  const formatJson = (jsonStr: string) => {
    try {
      return JSON.stringify(JSON.parse(jsonStr), null, 2);
    } catch {
      return jsonStr;
    }
  };

  const statusLabels: Record<number, string> = {
    0: t('logs.messageRecord.statusFailed'),
    1: t('logs.messageRecord.statusSuccess'),
    2: t('logs.messageRecord.statusRetrying'),
    3: t('logs.messageRecord.initStatus'),
  };

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: t('logs.messageRecord.messageId'), value: record.messageId },
    { label: t('logs.messageRecord.messageType'), value: record.messageType },
    { label: t('logs.messageRecord.businessId'), value: record.correlationId },
    { label: t('logs.messageRecord.queueName'), value: record.queueName },
    { label: t('logs.messageRecord.exchangeName'), value: record.exchangeName || '-' },
    { label: t('logs.messageRecord.routingKey'), value: record.routingKey || '-' },
    { label: t('logs.messageRecord.consumerService'), value: record.consumerService || '-' },
    { label: t('logs.messageRecord.consumerServerIp'), value: record.consumerIp || '-' },
    {
      label: t('logs.messageRecord.consumeStatus'),
      value:
        record.consumeStatus != null ? (
          <Chip
            label={statusLabels[record.consumeStatus] ?? record.consumeStatus}
            color={CONSUME_STATUS_COLOR[record.consumeStatus] ?? 'default'}
            size="small"
            variant="outlined"
          />
        ) : (
          '-'
        ),
    },
    { label: t('logs.messageRecord.retryCount'), value: record.retryCount ?? 0 },
    { label: t('logs.messageRecord.consumeTime'), value: record.consumeTime },
    { label: t('logs.messageRecord.createTime'), value: record.createTime },
    { label: t('logs.messageRecord.updateTime'), value: record.updateTime },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t('logs.messageRecord.messageDetail')}</DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Stack spacing={2}>
          {rows.map(({ label, value }) => (
            <Box
              key={label}
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
              <Typography component="div" variant="body2" sx={{ wordBreak: 'break-all' }}>
                {value}
              </Typography>
            </Box>
          ))}

          {/* Message Body */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              {t('logs.messageRecord.messageContent')}:
            </Typography>
            <Box
              component="pre"
              sx={{
                maxHeight: 300,
                overflow: 'auto',
                bgcolor: 'action.hover',
                borderRadius: 1,
                p: 2,
                fontSize: 'caption.fontSize',
                fontFamily: 'monospace',
              }}
            >
              {formatJson(record.messageBody)}
            </Box>
          </Box>

          {/* Error Message */}
          {record.errorMsg && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                {t('logs.messageRecord.errorMessage')}:
              </Typography>
              <Box
                component="pre"
                sx={{
                  maxHeight: 200,
                  overflow: 'auto',
                  bgcolor: 'error.lighter',
                  color: 'error.main',
                  borderRadius: 1,
                  p: 2,
                  fontSize: 'caption.fontSize',
                  fontFamily: 'monospace',
                }}
              >
                {record.errorMsg}
              </Box>
            </Box>
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
