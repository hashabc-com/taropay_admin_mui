import type { ChartDataOfDay } from 'src/api/dashboard';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { useConvertAmount } from 'src/hooks/use-convert-amount';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  chartResult: ChartDataOfDay | null;
  isLoading: boolean;
};

export function DashboardFlowCards({ chartResult, isLoading }: Props) {
  const { t } = useLanguage();
  const convertAmount = useConvertAmount();

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
      icon: 'solar:download-minimalistic-bold-duotone',
      color: 'primary' as const,
    },
    {
      label: t('dashboard.withdrawalAmount'),
      value: convertAmount(chartResult?.withdrawalAmount || 0),
      icon: 'solar:upload-minimalistic-bold-duotone',
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
            bgcolor: 'background.neutral',
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1.5,
              bgcolor: `${card.color}.lighter`,
              color: `${card.color}.main`,
            }}
          >
            <Iconify icon={card.icon} width={28} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {card.label}
            </Typography>
            <Typography variant="h6" noWrap>
              {card.value}
            </Typography>
          </Box>
        </Card>
      ))}
    </Stack>
  );
}
