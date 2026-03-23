import type { Order } from './types';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Iconify } from 'src/components/iconify';

import { ORDER_STATUS_MAP } from './types';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  order: Order | null;
};

export function OrderDetailDrawer({ open, onClose, order }: Props) {
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
            <Typography variant="h6">订单详情</Typography>
            <IconButton onClick={onClose}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>

          <Divider />

          {/* Content */}
          <Box sx={{ px: 2.5, py: 3, overflowY: 'auto', flex: 1 }}>
            <Stack spacing={3}>
              {/* 状态 */}
              <DetailRow label="状态">
                <Chip
                  label={statusInfo.label}
                  color={statusInfo.color}
                  size="small"
                  variant="filled"
                />
              </DetailRow>

              <Divider />

              {/* 商户信息 */}
              <SectionTitle>商户信息</SectionTitle>

              <DetailRow label="商户">{order.companyName || '-'}</DetailRow>
              <DetailRow label="手机号">{order.mobile || '-'}</DetailRow>
              <DetailRow label="用户名">{order.userName || '-'}</DetailRow>

              <Divider />

              {/* 订单号 */}
              <SectionTitle>订单号</SectionTitle>

              <DetailRow label="商户订单号" mono>
                {order.referenceno || '-'}
              </DetailRow>
              <DetailRow label="平台订单号" mono>
                {order.transId || '-'}
              </DetailRow>
              <DetailRow label="三方订单号" mono>
                {order.tripartiteOrder || '-'}
              </DetailRow>

              <Divider />

              {/* 产品 & 渠道 */}
              <SectionTitle>产品信息</SectionTitle>

              <DetailRow label="产品">
                {order.pickupCenter ? (
                  <Chip label={order.pickupCenter} size="small" variant="outlined" />
                ) : (
                  '-'
                )}
              </DetailRow>
              <DetailRow label="渠道">{order.paymentCompany || '-'}</DetailRow>

              <Divider />

              {/* 金额 */}
              <SectionTitle>金额信息</SectionTitle>

              <DetailRow label="订单金额" bold>
                {order.amount ?? '-'}
              </DetailRow>
              <DetailRow label="实际金额" bold>
                {order.realAmount ?? '-'}
              </DetailRow>
              <DetailRow label="手续费" bold>
                {order.serviceAmount ?? '-'}
              </DetailRow>

              <Divider />

              {/* 时间 */}
              <SectionTitle>时间信息</SectionTitle>

              <DetailRow label="创建时间">{order.localTime || order.createTime || '-'}</DetailRow>
              <DetailRow label="完成时间">
                {order.status === '2' ? order.updateTime || '-' : order.localPaymentDate || '-'}
              </DetailRow>

              {/* 失败原因 */}
              {order.status === '2' && order.message && (
                <>
                  <Divider />
                  <DetailRow label="失败原因">
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
              关闭
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
