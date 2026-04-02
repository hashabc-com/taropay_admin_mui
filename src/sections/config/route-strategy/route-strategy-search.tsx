import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  onAdd: () => void;
  onRefresh: () => void;
};

export function RouteStrategySearch({ onAdd, onRefresh }: Props) {
  const { t } = useLanguage();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
      <Button
        variant="contained"
        size="small"
        onClick={onRefresh}
        startIcon={<Iconify icon="solar:refresh-bold" />}
      >
        {t('common.refresh')}
      </Button>

      <Box sx={{ flexGrow: 1 }} />

      <Button
        variant="contained"
        size="small"
        onClick={onAdd}
        startIcon={<Iconify icon="mingcute:add-line" />}
      >
        {t('config.routeStrategy.addRouteConfig')}
      </Button>
    </Box>
  );
}
