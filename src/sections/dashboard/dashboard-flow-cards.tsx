import type { ChartDataOfDay } from 'src/api/dashboard';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { useConvertAmount } from 'src/hooks/use-convert-amount';

import { useCountryStore } from 'src/stores/country-store';
import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';
import { AnimateCountUp } from 'src/components/animate';

// ----------------------------------------------------------------------

type Props = {
  chartResult: ChartDataOfDay | null;
  isLoading: boolean;
};

export function DashboardFlowCards({ chartResult, isLoading }: Props) {
  const { t } = useLanguage();
  const convertAmount = useConvertAmount();
  const { displayCurrency } = useCountryStore();

  if (isLoading) {
    return (
      <Stack spacing={2} sx={{ justifyContent: 'center' }}>
        <Skeleton variant="rounded" height={80} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rounded" height={80} sx={{ borderRadius: 2 }} />
      </Stack>
    );
  }

  const cards = [
    {
      label: t('dashboard.rechargeAmount'),
      value: convertAmount(chartResult?.rechargeAmount || 0),
      numericValue: Number(convertAmount(chartResult?.rechargeAmount || 0, false, false)) || 0,
      icon: 'solar:card-transfer-bold',
      color: 'primary' as const,
    },
    {
      label: t('dashboard.withdrawalAmount'),
      value: convertAmount(chartResult?.withdrawalAmount || 0),
      numericValue: Number(convertAmount(chartResult?.withdrawalAmount || 0, false, false)) || 0,
      icon: 'solar:wad-of-money-bold',
      color: 'success' as const,
    },
  ];

  return (
    <Stack spacing={2} sx={{ justifyContent: 'center' }}>
      {cards.map((card) => (
        <Card
          key={card.label}
          sx={{
            p: 2.5,
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1.5,
              bgcolor: `${card.color}.lighter`,
              color: `${card.color}.main`,
              flexShrink: 0,
            }}
          >
            <Iconify icon={card.icon} width={24} />
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
                toFixed={2}
                duration={1.5}
                disableShorten
              />
            </Box>
          </Box>
        </Card>
      ))}
    </Stack>
  );
}
