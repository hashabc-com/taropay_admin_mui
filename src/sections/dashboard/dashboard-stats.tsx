import type { AmountInfo } from 'src/api/dashboard';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { useConvertAmount } from 'src/hooks/use-convert-amount';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  amountInfo: AmountInfo | null;
  isLoading: boolean;
};

export function DashboardStats({ amountInfo, isLoading }: Props) {
  const { t } = useLanguage();
  const convertAmount = useConvertAmount();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
        }}
      >
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  const balanceCards = [
    {
      label: t('dashboard.availableBalance'),
      value: convertAmount(amountInfo?.availableAmount || 0),
      icon: 'solar:wallet-bold-duotone',
      color: 'primary' as const,
    },
    {
      label: t('dashboard.pendingSettlement'),
      value: convertAmount(amountInfo?.frozenAmount || 0),
      icon: 'solar:clock-circle-bold-duotone',
      color: 'info' as const,
    },
    {
      label: t('dashboard.frozenAmount'),
      value: convertAmount(amountInfo?.rechargeAmount || 0),
      icon: 'solar:lock-keyhole-bold-duotone',
      color: 'warning' as const,
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 3,
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
      }}
    >
      {balanceCards.map((card) => (
        <Card key={card.label} sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
              bgcolor: `${card.color}.lighter`,
              color: `${card.color}.darker`,
            }}
          >
            <Iconify icon={card.icon} width={32} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              {card.label}
            </Typography>
            <Typography variant="h5" noWrap>
              {card.value}
            </Typography>
          </Box>
        </Card>
      ))}
    </Box>
  );
}
