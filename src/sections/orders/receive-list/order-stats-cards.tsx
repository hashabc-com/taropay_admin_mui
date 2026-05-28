import type { OrderStats } from './types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type StatCardData = {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  bgcolor: string;
};

function StatCard({ label, value, icon, color, bgcolor }: StatCardData) {
  return (
    <Card
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        minHeight: 76,
        minWidth: 0,
        borderLeft: 3,
        borderColor: color,
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          bgcolor,
          flexShrink: 0,
        }}
      >
        <Iconify icon={icon} width={20} sx={{ color }} />
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            color: 'text.secondary',
            fontWeight: 600,
            lineHeight: 1.2,
            wordBreak: 'break-word',
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, lineHeight: 1.25, overflowWrap: 'anywhere' }}
        >
          {value}
        </Typography>
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

const CARD_COUNT = 11;
const SUCCESS_RATE_ICON = 'solar:graph-up-bold';
const SUCCESS_RATE_COLOR = 'warning.main';
const SUCCESS_RATE_BGCOLOR = 'warning.lighter';

function formatPercent(value: string | number) {
  const text = String(value ?? '').trim();

  if (!text) return '0%';

  return text.includes('%') ? text : `${text}%`;
}

// ----------------------------------------------------------------------

type Props = {
  stats: OrderStats;
  isLoading?: boolean;
};

export function OrderStatsCards({ stats, isLoading }: Props) {
  const { t } = useLanguage();

  const cards: StatCardData[] = [
    {
      label: t('orders.stats.totalOrders'),
      value: stats.allOrder.toLocaleString(),
      icon: 'solar:hashtag-bold',
      color: 'primary.main',
      bgcolor: 'primary.lighter',
    },
    {
      label: t('orders.stats.successOrders'),
      value: stats.successOrder.toLocaleString(),
      icon: 'solar:check-circle-bold',
      color: 'success.main',
      bgcolor: 'success.lighter',
    },
    {
      label: t('orders.stats.failedOrders'),
      value: stats.failedOrder.toLocaleString(),
      icon: 'solar:close-circle-bold',
      color: 'error.main',
      bgcolor: 'error.lighter',
    },
    {
      label: t('orders.stats.orderAmount'),
      value: stats.orderAmount || 0,
      icon: 'solar:wallet-money-bold',
      color: 'info.main',
      bgcolor: 'info.lighter',
    },
    {
      label: t('orders.stats.successRate'),
      value: formatPercent(stats.successRate),
      icon: SUCCESS_RATE_ICON,
      color: SUCCESS_RATE_COLOR,
      bgcolor: SUCCESS_RATE_BGCOLOR,
    },
    {
      label: t('orders.stats.fiveMinuteSuccessRate'),
      value: formatPercent(stats.fiveMinuteSuccessRate),
      icon: SUCCESS_RATE_ICON,
      color: SUCCESS_RATE_COLOR,
      bgcolor: SUCCESS_RATE_BGCOLOR,
    },
    {
      label: t('orders.stats.tenMinuteSuccessRate'),
      value: formatPercent(stats.tenMinuteSuccessRate),
      icon: SUCCESS_RATE_ICON,
      color: SUCCESS_RATE_COLOR,
      bgcolor: SUCCESS_RATE_BGCOLOR,
    },
    {
      label: t('orders.stats.fifteenMinuteSuccessRate'),
      value: formatPercent(stats.fifteenMinuteSuccessRate),
      icon: SUCCESS_RATE_ICON,
      color: SUCCESS_RATE_COLOR,
      bgcolor: SUCCESS_RATE_BGCOLOR,
    },
    {
      label: t('orders.stats.thirtyMinuteSuccessRate'),
      value: formatPercent(stats.thirtyMinuteSuccessRate),
      icon: SUCCESS_RATE_ICON,
      color: SUCCESS_RATE_COLOR,
      bgcolor: SUCCESS_RATE_BGCOLOR,
    },
    {
      label: t('orders.stats.oneHourSuccessRate'),
      value: formatPercent(stats.oneHourSuccessRate),
      icon: SUCCESS_RATE_ICON,
      color: SUCCESS_RATE_COLOR,
      bgcolor: SUCCESS_RATE_BGCOLOR,
    },
    {
      label: t('orders.stats.todaySuccessRate'),
      value: formatPercent(stats.todaySuccessRate),
      icon: SUCCESS_RATE_ICON,
      color: SUCCESS_RATE_COLOR,
      bgcolor: SUCCESS_RATE_BGCOLOR,
    },
  ];

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(4, minmax(0, 1fr))',
            lg: 'repeat(6, minmax(0, 1fr))',
          },
          gap: 2,
          mb: 3,
        }}
      >
        {Array.from({ length: CARD_COUNT }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={80} />
        ))}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(4, minmax(0, 1fr))',
          lg: 'repeat(6, minmax(0, 1fr))',
        },
        gap: 2,
        mb: 3,
      }}
    >
      {cards.map((c) => (
        <StatCard key={c.label} {...c} />
      ))}
    </Box>
  );
}
