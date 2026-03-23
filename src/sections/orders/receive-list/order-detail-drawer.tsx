import type { Order } from './types';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

import { ORDER_STATUS_MAP } from './types';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  order: Order | null;
};

export function OrderDetailDrawer({ open, onClose, order }: Props) {
  const { t } = useLanguage();
  const statusInfo = order
    ? (ORDER_STATUS_MAP[order.status] ?? { label: order.status, color: 'default' as const })
    : { label: '', color: 'default' as const };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ zIndex: 1400 }}
      PaperProps={{ sx: { width: { xs: '100%', sm: 480 } } }}
    >
      {order && (
        <>
          {/* Header */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 2.5, py: 2 }}
          >
            <Typography variant="h6">{t('orders.receiveOrders.orderDetails')}</Typography>
            <IconButton onClick={onClose}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>

          <Divider />

          {/* Content */}
          <Box sx={{ px: 2.5, py: 3, overflowY: 'auto', flex: 1 }}>
            <Stack spacing={3}>
              <DetailRow label={t('orders.receiveOrders.status')}>
                <Chip
                  label={statusInfo.label}
                  color={statusInfo.color}
                  size="small"
                  variant="filled"
                />
              </DetailRow>

              <Divider />

              <SectionTitle>{t('orders.receiveOrders.merchant')}</SectionTitle>

              <DetailRow label={t('orders.receiveOrders.merchant')}>
                {order.companyName || '-'}
              </DetailRow>
              <DetailRow label={t('orders.receiveOrders.mobile')}>{order.mobile || '-'}</DetailRow>
              <DetailRow label={t('signIn.username')}>{order.userName || '-'}</DetailRow>

              <Divider />

              <SectionTitle>{t('orders.receiveOrders.merchantOrderNo')}</SectionTitle>

              <DetailRow label={t('orders.receiveOrders.merchantOrderNo')} mono>
                {order.referenceno || '-'}
              </DetailRow>
              <DetailRow label={t('orders.receiveOrders.platformOrderNo')} mono>
                {order.transId || '-'}
              </DetailRow>
              <DetailRow label={t('orders.receiveOrders.thirdPartyOrderNo')} mono>
                {order.tripartiteOrder || '-'}
              </DetailRow>

              <Divider />

              <SectionTitle>{t('orders.receiveOrders.product')}</SectionTitle>

              <DetailRow label={t('orders.receiveOrders.product')}>
                {order.pickupCenter ? (
                  <Chip label={order.pickupCenter} size="small" variant="outlined" />
                ) : (
                  '-'
                )}
              </DetailRow>
              <DetailRow label={t('common.channel')}>{order.paymentCompany || '-'}</DetailRow>

              <Divider />

              <SectionTitle>{t('orders.receiveOrders.orderAmount')}</SectionTitle>

              <DetailRow label={t('orders.receiveOrders.orderAmount')} bold>
                {order.amount ?? '-'}
              </DetailRow>
              <DetailRow label={t('orders.receiveOrders.realAmount')} bold>
                {order.realAmount ?? '-'}
              </DetailRow>
              <DetailRow label={t('orders.receiveOrders.serviceFee')} bold>
                {order.serviceAmount ?? '-'}
              </DetailRow>

              <Divider />

              <SectionTitle>{t('orders.receiveOrders.createTime')}</SectionTitle>

              <DetailRow label={t('orders.receiveOrders.createTime')}>
                {order.localTime || order.createTime || '-'}
              </DetailRow>
              <DetailRow label={t('orders.receiveOrders.finishTime')}>
                {order.status === '2' ? order.updateTime || '-' : order.localPaymentDate || '-'}
              </DetailRow>

              {order.status === '2' && order.message && (
                <>
                  <Divider />
                  <DetailRow label={t('orders.receiveOrders.failReason')}>
                    <Typography variant="body2" color="error.main">
                      {order.message}
                    </Typography>
                  </DetailRow>
                </>
              )}
            </Stack>
          </Box>

          {/* Footer */}
          <Divider />
          <Box sx={{ p: 2.5 }}>
            <Button variant="outlined" fullWidth onClick={onClose}>
              {t('common.close')}
            </Button>
          </Box>
        </>
      )}
    </Drawer>
  );
}

// ----------------------------------------------------------------------

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 700 }}>
      {children}
    </Typography>
  );
}

// ----------------------------------------------------------------------

type DetailRowProps = {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
  bold?: boolean;
};

function DetailRow({ label, children, mono, bold }: DetailRowProps) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
      <Typography variant="body2" sx={{ color: 'text.secondary', flexShrink: 0, minWidth: 90 }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          textAlign: 'right',
          wordBreak: 'break-all',
          ...(mono && { fontFamily: 'monospace', fontSize: 13 }),
          ...(bold && { fontWeight: 600 }),
        }}
      >
        {children}
      </Typography>
    </Stack>
  );
}
