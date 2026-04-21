import type { AmountInfo } from 'src/api/dashboard';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { useConvertAmount } from 'src/hooks/use-convert-amount';

import { useCountryStore } from 'src/stores/country-store';
import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';
import { AnimateCountUp } from 'src/components/animate';

// ----------------------------------------------------------------------

type Props = {
  amountInfo: AmountInfo | null;
  isLoading: boolean;
};

export function DashboardStats({ amountInfo, isLoading }: Props) {
  const { t } = useLanguage();
  const convertAmount = useConvertAmount();
  const { displayCurrency } = useCountryStore();

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
      numericValue: Number(convertAmount(amountInfo?.availableAmount || 0, false, false)) || 0,
      icon: 'solar:dollar-bold',
      color: 'primary' as const,
    },
    {
      label: t('dashboard.pendingSettlement'),
      value: convertAmount(amountInfo?.frozenAmount || 0),
      numericValue: Number(convertAmount(amountInfo?.frozenAmount || 0, false, false)) || 0,
      icon: 'solar:clock-circle-bold',
      color: 'info' as const,
    },
    {
      label: t('dashboard.frozenAmount'),
      value: convertAmount(amountInfo?.rechargeAmount || 0),
      numericValue: Number(convertAmount(amountInfo?.rechargeAmount || 0, false, false)) || 0,
      icon: 'solar:lock-password-bold',
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
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1.5,
              bgcolor: `${card.color}.lighter`,
              color: `${card.color}.main`,
              flexShrink: 0,
            }}
          >
            <Iconify icon={card.icon} width={28} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              {card.label}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
              {displayCurrency && (
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mr: 1 }}>
                  {displayCurrency}
                </Typography>
              )}
              <AnimateCountUp
                variant="h5"
                to={card.numericValue}
                duration={1.5}
                toFixed={2}
                disableShorten
              />
            </Box>
          </Box>
        </Card>
      ))}
    </Box>
  );
}
